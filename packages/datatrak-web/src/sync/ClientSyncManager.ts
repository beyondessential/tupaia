import { QueryClient } from '@tanstack/react-query';
import mitt from 'mitt';
import log from 'winston';

import {
  FACT_CURRENT_SYNC_TICK,
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  FACT_LAST_SUCCESSFUL_SYNC_PUSH,
  FACT_PROJECTS_IN_SYNC,
  SYNC_STREAM_MESSAGE_KIND,
} from '@tupaia/constants';
import {
  createClientSnapshotTable,
  dropAllSnapshotTables,
  dropSnapshotTable,
  getModelsForPull,
  getModelsForPush,
  saveChangesFromMemory,
  saveIncomingSnapshotChanges,
  waitForPendingEditsUsingSyncTick,
  withDeferredSyncSafeguards,
} from '@tupaia/sync';
import { ensure } from '@tupaia/tsutils';
import { Project, ValueOf } from '@tupaia/types';
import { remove, stream } from '../api';
import { DatatrakDatabase } from '../database/DatatrakDatabase';
import {
  DatatrakWebModelRegistry,
  ProcessStreamDataParams,
  SYNC_EVENT_ACTIONS,
  SYNC_STATUS,
  SyncEvents,
  SyncStatus,
} from '../types';
import { formatFraction } from '../utils';
import { getDeviceId } from './getDeviceId';
import { getSyncTick } from './getSyncTick';
import { insertSnapshotRecords } from './insertSnapshotRecords';
import { initiatePull, pullIncomingChanges } from './pullIncomingChanges';
import { pushOutgoingChanges } from './pushOutgoingChanges';
import { snapshotOutgoingChanges } from './snapshotOutgoingChanges';

const SYNC_INTERVAL = 1000 * 30;

const SYNC_STAGES = {
  PUSH: 1,
  PULL: 2,
  PERSIST: 3,
} as const;

export type SyncStage = ValueOf<typeof SYNC_STAGES>;

const STAGE_MAX_PROGRESS_INCREMENTAL = {
  [SYNC_STAGES.PUSH]: 33,
  [SYNC_STAGES.PULL]: 66,
  [SYNC_STAGES.PERSIST]: 100,
} as const;

const STAGE_MAX_PROGRESS_INITIAL = {
  [SYNC_STAGES.PUSH]: 33,
  [SYNC_STAGES.PULL]: 100,
} as const;

export interface SyncResult {
  pulledChangesCount?: number;
}

export class ClientSyncManager {
  static #instance: ClientSyncManager | null = null;

  static async getInstance(models: DatatrakWebModelRegistry): Promise<ClientSyncManager> {
    if (!ClientSyncManager.#instance) {
      const deviceId = await getDeviceId(models);
      ClientSyncManager.#instance = new ClientSyncManager(models, deviceId);
    }
    return ClientSyncManager.#instance;
  }

  #database: DatatrakDatabase;

  #models: DatatrakWebModelRegistry;

  #deviceId: string;

  #urgentSyncInterval: ReturnType<typeof setInterval> | null = null;

  #isInitialSync: boolean = false;

  #syncInterval: ReturnType<typeof setInterval> | null = null;

  #progressMaxByStage: typeof STAGE_MAX_PROGRESS_INCREMENTAL | typeof STAGE_MAX_PROGRESS_INITIAL =
    STAGE_MAX_PROGRESS_INCREMENTAL;

  /** Update with private setter {@link status}, which emits update event. */
  #status: SyncStatus = SYNC_STATUS.IDLE;

  /** Update with private setter {@link syncStage}, which emits update event. */
  #syncStage: SyncStage | null = null;

  /** Update with private method {@link setProgress}, which emits update event. */
  #progress: number | null = null;

  #statusMessage: string | null = null;

  #errorMessage: string | null = null;

  #lastSuccessfulSyncTime: Date | null = null;

  #emitter = mitt<SyncEvents>();

  constructor(models: DatatrakWebModelRegistry, deviceId: string) {
    this.#models = models;
    this.#database = models.database;
    this.#deviceId = deviceId;
    this.#progress = 0;
    log.debug('ClientSyncManager.constructor', {
      deviceId,
    });
  }

  get status(): SyncStatus {
    return this.#status;
  }

  private set status(status: SyncStatus) {
    this.#status = status;
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STATUS_CHANGED, { status });

    switch (status) {
      case SYNC_STATUS.REQUESTING:
        this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_REQUESTING);
        return;
      case SYNC_STATUS.QUEUING:
        this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE);
        return;
      case SYNC_STATUS.SYNCING:
        this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STARTED);
        return;
      case SYNC_STATUS.IDLE:
        this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_ENDED);
        return;
      case SYNC_STATUS.ERROR: // Error event is emitted in the catch block of triggerSync
      case SYNC_STATUS.STOPPED: // No corresponding event
        return;
    }
  }

  get isRequestingSync() {
    return this.#status === SYNC_STATUS.REQUESTING;
  }

  get isQueuing() {
    return this.#status === SYNC_STATUS.QUEUING;
  }

  get isSyncing() {
    return this.#status === SYNC_STATUS.SYNCING;
  }

  get syncStage() {
    return this.#syncStage;
  }

  get progress() {
    return this.#progress;
  }

  get statusMessage() {
    return this.#statusMessage;
  }

  get errorMessage() {
    return this.#errorMessage;
  }

  get lastSuccessfulSyncTime() {
    return this.#lastSuccessfulSyncTime;
  }

  get emitter() {
    return this.#emitter;
  }

  get stageCount() {
    return Object.keys(this.#progressMaxByStage).length;
  }

  private set syncStage(syncStage: SyncStage | null) {
    this.#syncStage = syncStage;
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STAGE_CHANGED, { syncStage });
  }

  async startSyncService(queryClient: QueryClient): Promise<void> {
    if (this.#syncInterval) return;

    await this.waitForCurrentSyncToEnd();

    log.info('Starting sync service');
    const run = async (): Promise<void> => {
      log.info('Running regular sync');
      await this.triggerSync(false, queryClient);
    };

    // Run the sync immediately
    // and then schedule the next sync
    run();
    this.#syncInterval = setInterval(run, SYNC_INTERVAL);
  }

  async stopSyncService(): Promise<void> {
    if (this.#syncInterval) {
      log.info('Stopping sync service');
      clearInterval(this.#syncInterval);
      await this.waitForCurrentSyncToEnd();
    }

    this.#syncInterval = null;
    this.status = SYNC_STATUS.STOPPED;
    this.setProgress(0, null);
    this.syncStage = null;
    this.#lastSuccessfulSyncTime = null;
  }

  async waitForCurrentSyncToEnd(): Promise<void> {
    if (this.isSyncing) {
      return new Promise(resolve => {
        const done = (): void => {
          resolve();
          this.emitter.off(SYNC_EVENT_ACTIONS.SYNC_ENDED, done);
        };
        this.emitter.on(SYNC_EVENT_ACTIONS.SYNC_ENDED, done);
      });
    }

    return Promise.resolve();
  }

  /**
   * Set the current progress (%) and the current progress message for the circular progress bar
   */
  private setProgress(progress: number, message: string | null): void {
    this.#progress = progress;
    this.#statusMessage = message;
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_PROGRESS_CHANGED, { progress, message });
  }

  /**
   * Calculate the current progress (%) using the final total and the current records in progress
   * @param total total number of records to process
   * @param progress number of records processed
   * @param message message to display in the progress bar
   */
  private updateProgress = (total: number, progress: number, message: string): void => {
    const syncStage = ensure(this.syncStage);

    // Get previous stage max progress
    const previousProgress = this.#progressMaxByStage[syncStage - 1] ?? 0;
    // Calculate the total progress of the current stage
    const progressDenominator = this.#progressMaxByStage[syncStage] - previousProgress;
    // Calculate the progress percentage of the current stage
    // (ie: out of stage 2 which is 33% of the overall progress)
    const currentStagePercentage = Math.min(
      Math.floor((progress / total) * progressDenominator),
      progressDenominator,
    );
    // Add the finished stage progress to get the overall progress percentage
    const progressPercentage = previousProgress + currentStagePercentage;
    this.setProgress(progressPercentage, message);
  };

  async getProjectsInSync(): Promise<Project['id'][]> {
    const syncedProjectsFact = await this.#models.localSystemFact.get(FACT_PROJECTS_IN_SYNC);
    const syncedProjectIds = syncedProjectsFact ? JSON.parse(syncedProjectsFact) : [];
    return syncedProjectIds;
  }

  async triggerSync(urgent: boolean = false, queryClient: QueryClient): Promise<void> {
    if (this.isSyncing) {
      log.warn('ClientSyncManager.triggerSync(): Tried to start syncing while sync in progress');
      return;
    }

    try {
      const isOnline = window.navigator.onLine;

      if (!isOnline) {
        throw new Error('No internet connectivity');
      }

      const { pulledChangesCount } = await this.runSync(urgent);
      if (pulledChangesCount) {
        await queryClient.invalidateQueries();
      }
      this.status = SYNC_STATUS.IDLE;
    } catch (error: any) {
      this.status = SYNC_STATUS.ERROR;
      this.#errorMessage = error.message;
      this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_ERROR, { error: error.message });
    } finally {
      this.setProgress(0, null);
      this.syncStage = null;

      if (this.#urgentSyncInterval) {
        clearInterval(this.#urgentSyncInterval);
        this.#urgentSyncInterval = null;
      }
    }
  }

  /**
   * Trigger urgent sync, and along with urgent sync, schedule regular sync requests
   * to continuously connect to central server and request for status change of the sync session
   */
  async triggerUrgentSync(queryClient: QueryClient): Promise<void> {
    if (this.#urgentSyncInterval) {
      log.warn('ClientSyncManager.triggerUrgentSync(): Urgent sync already started');
      return;
    }

    const urgentSyncIntervalInSeconds = 10;

    // Schedule regular urgent sync
    this.#urgentSyncInterval = setInterval(
      () => this.triggerSync(true, queryClient),
      urgentSyncIntervalInSeconds * 1000,
    );

    // start the sync now
    return await this.triggerSync(true, queryClient);
  }

  async runSync(urgent: boolean = false): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error(
        'It should not be possible to call "runSync" while an existing run is active',
      );
    }

    this.#errorMessage = null;
    this.#statusMessage = 'Requesting sync…';
    this.status = SYNC_STATUS.REQUESTING;

    const projectIds = await this.getProjectsInSync();

    if (projectIds.length === 0) {
      log.warn('ClientSyncManager.runSync(): No projects in sync');
      return {};
    }

    const pullSince = await getSyncTick(this.#models, FACT_LAST_SUCCESSFUL_SYNC_PULL);

    this.#isInitialSync = pullSince === -1;

    this.#progressMaxByStage = this.#isInitialSync
      ? STAGE_MAX_PROGRESS_INITIAL
      : STAGE_MAX_PROGRESS_INCREMENTAL;

    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('startSyncSession');
    const { sessionId, startedAtTick, status } = await this.startSyncSession(urgent, pullSince);

    if (!sessionId) {
      log.debug(`ClientSyncManager.runSync(): Sync queue status: ${status}`);
      this.status = SYNC_STATUS.QUEUING;
      this.setProgress(0, urgent ? 'Sync in progress…' : 'Sync in queue');
      return {};
    }

    this.setProgress(0, 'Initialising sync');
    this.status = SYNC_STATUS.SYNCING;

    // clear previous temp data, in case last session errored out or server was restarted
    await dropAllSnapshotTables(this.#database);

    log.debug('ClientSyncManager.receivedSessionInfo', {
      sessionId,
      startedAtTick,
    });

    await this.pushChanges(sessionId, startedAtTick);

    const pulledChangesCount = await this.pullChanges(sessionId, projectIds);

    await this.endSyncSession(sessionId);

    performance.mark('endSyncSession');
    log.info(
      'ClientSyncManager.completedSession',
      performance.measure('syncDuration', 'startSyncSession', 'endSyncSession'),
    );

    // clear temp data stored for persist
    await dropSnapshotTable(this.#database, sessionId);

    this.#lastSuccessfulSyncTime = new Date();

    return { pulledChangesCount };
  }

  async startSyncSession(urgent: boolean, lastSyncedTick: number) {
    for await (const { kind, message } of stream(() => ({
      method: 'POST',
      endpoint: 'sync',
      options: {
        deviceId: this.#deviceId,
        urgent,
        lastSyncedTick,
      },
    }))) {
      handler: switch (kind) {
        case SYNC_STREAM_MESSAGE_KIND.SESSION_WAITING:
          // still waiting
          break handler;
        case SYNC_STREAM_MESSAGE_KIND.END:
          // includes the new tick from starting the session
          return { ...message };
        default:
          log.warn(`Unexpected message kind: ${kind}`);
      }
    }
    throw new Error('Unexpected end of stream');
  }

  async endSyncSession(sessionId: string) {
    return remove(`sync/${sessionId}`);
  }

  async pushChanges(sessionId: string, newSyncClockTime: number) {
    this.syncStage = SYNC_STAGES.PUSH;
    this.setProgress(0, 'Pushing all new changes…');

    // get the sync tick we're up to locally, so that we can store it as the successful push cursor
    const currentSyncClockTime = await getSyncTick(this.#models, FACT_CURRENT_SYNC_TICK);

    // use the new unique sync tick for any changes from now on so that any records that are created
    // or updated even mid way through this sync, are marked using the new tick and will be captured
    // in the next push
    await this.#models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, newSyncClockTime);
    log.debug('ClientSyncManager.updatedLocalSyncClockTime', { newSyncClockTime });

    await waitForPendingEditsUsingSyncTick(this.#database, currentSyncClockTime);

    // syncing outgoing changes happens in two phases: taking a point-in-time copy of all records
    // to be pushed, and then pushing those up in batches
    // this avoids any of the records to be pushed being changed during the push period and
    // causing data that isn't internally coherent from ending up on the central server
    const pushSince = await getSyncTick(this.#models, FACT_LAST_SUCCESSFUL_SYNC_PUSH);
    log.debug('ClientSyncManager.snapshotOutgoingChanges', { pushSince });

    // snapshot inside a "repeatable read" transaction, so that other changes made while this snapshot
    // is underway aren't included (as this could lead to a pair of foreign records with the child in
    // the snapshot and its parent missing)
    // as the snapshot only contains read queries, there will be no concurrent update issues :)
    const outgoingChanges = await this.#models.wrapInRepeatableReadTransaction(
      async transactingModels => {
        const modelsForPush = getModelsForPush(transactingModels.getModels());
        return snapshotOutgoingChanges(modelsForPush, transactingModels.tombstone, pushSince);
      },
    );

    if (outgoingChanges.length > 0) {
      log.debug('ClientSyncManager.pushingOutgoingChanges', {
        totalPushing: outgoingChanges.length,
      });
      await pushOutgoingChanges(
        sessionId,
        outgoingChanges,
        this.#deviceId,
        (total, pushedRecords) =>
          this.updateProgress(total, pushedRecords, 'Pushing all new changes…'),
      );
    }

    await this.#models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PUSH, currentSyncClockTime);
    log.debug('ClientSyncManager.updatedLastSuccessfulPush', { currentSyncClockTime });
  }

  async pullChanges(sessionId: string, projectIds: Project['id'][]): Promise<number> {
    this.syncStage = SYNC_STAGES.PULL;

    try {
      log.debug('ClientSyncManager.pullChanges', {
        sessionId,
        projectIds,
      });

      // This is the start of stage 2 which is calling pull/initiate.
      // At this stage, we don't really know how long it will take.
      // So only showing a message to indicate this this is still in progress
      this.setProgress(
        this.#progressMaxByStage[SYNC_STAGES.PULL - 1],
        'Pausing at 33% while server prepares for pull, please wait…',
      );

      const pullSince = await getSyncTick(this.#models, FACT_LAST_SUCCESSFUL_SYNC_PULL);

      log.debug('ClientSyncManager.createClientSnapshotTable', {
        sessionId,
      });
      await createClientSnapshotTable(this.#database, sessionId);

      log.debug('ClientSyncManager.initiatePull', {
        sessionId,
        pullSince,
      });
      const { totalToPull, pullUntil } = await initiatePull(
        sessionId,
        pullSince,
        projectIds,
        this.#deviceId,
      );

      this.setProgress(this.#progressMaxByStage[SYNC_STAGES.PULL - 1], 'Pulling changes…');

      const isInitialPull = pullSince === -1;

      // 1. If the pull is initial, we wrap the whole pull in a transaction and persist the stream data straight to the actual tables
      //    When leaving a long running transaction open, any user trying to update those same records in Tamanu will be blocked until the sync finishes.
      //    This is not a problem for initial sync because there is no local data, so it is fine to leave a long running transaction open.
      // 2. If the pull is incremental, we save the stream data to a temporary snapshot table and then use a transaction to persist the data to the actual tables
      //    This is because we don't want to block the user from updating the records in Tamanu while a long sync is running.
      //    Also, we don't want to cause memory issues by saving all the data to memory.
      if (isInitialPull) {
        await this.pullInitialSync(sessionId, totalToPull, pullUntil);
      } else {
        await this.pullIncrementalSync(sessionId, totalToPull, pullUntil);
      }

      return totalToPull;
    } catch (error) {
      log.error('ClientSyncManager.pullChanges', {
        sessionId,
        error,
      });
      throw error;
    }
  }

  async pullInitialSync(sessionId: string, totalToPull: number, pullUntil: number) {
    let totalSaved = 0;
    const progressCallback = (incrementalSaved: number) => {
      totalSaved += Number(incrementalSaved);
      this.updateProgress(
        totalToPull,
        totalSaved,
        `Saving changes (${formatFraction(totalSaved, totalToPull)})`,
      );
    };

    await this.#models.wrapInTransaction(async transactingModels => {
      const processStreamedDataFunction = async ({ models, records }: ProcessStreamDataParams) => {
        await saveChangesFromMemory(models, records, false, progressCallback);
      };

      const batchSize = 10000;
      await withDeferredSyncSafeguards(transactingModels.database, () =>
        pullIncomingChanges(transactingModels, sessionId, batchSize, processStreamedDataFunction),
      );

      // update the last successful sync in the same save transaction - if updating the cursor fails,
      // we want to roll back the rest of the saves so that we don't end up detecting them as
      // needing a sync up to the central server when we attempt to resync from the same old cursor
      log.debug('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
      return transactingModels.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
    });
  }

  async pullIncrementalSync(sessionId: string, totalToPull: number, pullUntil: number) {
    let pullTotal = 0;
    const pullProgressCallback = (incrementalPulled: number) => {
      pullTotal += Number(incrementalPulled);
      this.updateProgress(
        totalToPull,
        pullTotal,
        `Pulling changes (${formatFraction(pullTotal, totalToPull)})`,
      );
    };
    const processStreamedDataFunction = async ({
      models,
      sessionId,
      records,
    }: ProcessStreamDataParams) => {
      await insertSnapshotRecords(models.database, sessionId, records);
      pullProgressCallback(records.length);
    };

    const batchSize = 10000;
    await pullIncomingChanges(this.#models, sessionId, batchSize, processStreamedDataFunction);

    this.setProgress(this.#progressMaxByStage[SYNC_STAGES.PERSIST - 1], 'Saving changes…');
    this.syncStage = SYNC_STAGES.PERSIST;
    let totalSaved = 0;
    const saveProgressCallback = (incrementalSaved: number) => {
      totalSaved += Number(incrementalSaved);
      this.updateProgress(
        totalToPull,
        totalSaved,
        `Saving changes (${formatFraction(totalSaved, totalToPull)})`,
      );
    };
    await this.#models.wrapInTransaction(async transactingModels => {
      const incomingModels = getModelsForPull(transactingModels.getModels());
      await withDeferredSyncSafeguards(transactingModels.database, () =>
        saveIncomingSnapshotChanges(incomingModels, sessionId, false, saveProgressCallback),
      );

      // update the last successful sync in the same save transaction - if updating the cursor fails,
      // we want to roll back the rest of the saves so that we don't end up detecting them as
      // needing a sync up to the central server when we attempt to resync from the same old cursor
      log.debug('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
      return transactingModels.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
    });
  }
}
