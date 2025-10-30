import log from 'winston';
import mitt from 'mitt';
import { QueryClient } from '@tanstack/react-query';

import {
  createClientSnapshotTable,
  dropAllSnapshotTables,
  dropSnapshotTable,
  saveChangesFromMemory,
  saveIncomingSnapshotChanges,
  waitForPendingEditsUsingSyncTick,
  getModelsForPush,
  getModelsForPull,
  withDeferredSyncSafeguards,
} from '@tupaia/sync';
import {
  SYNC_STREAM_MESSAGE_KIND,
  FACT_CURRENT_SYNC_TICK,
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  FACT_LAST_SUCCESSFUL_SYNC_PUSH,
  FACT_PROJECTS_IN_SYNC,
} from '@tupaia/constants';
import { ensure } from '@tupaia/tsutils';

import { DatatrakDatabase } from '../database/DatatrakDatabase';
import { initiatePull, pullIncomingChanges } from './pullIncomingChanges';
import { DatatrakWebModelRegistry, ProcessStreamDataParams, SYNC_EVENT_ACTIONS } from '../types';
import { snapshotOutgoingChanges } from './snapshotOutgoingChanges';
import { pushOutgoingChanges } from './pushOutgoingChanges';
import { insertSnapshotRecords } from './insertSnapshotRecords';
import { remove, stream } from '../api';
import { getDeviceId } from './getDeviceId';
import { getSyncTick } from './getSyncTick';

const SYNC_INTERVAL = 1000 * 30;

const SYNC_STAGES = {
  PUSH: 1,
  PULL: 2,
  PERSIST: 3,
};

type StageMaxProgress = Record<number, number>;

const STAGE_MAX_PROGRESS_INCREMENTAL: StageMaxProgress = {
  [SYNC_STAGES.PUSH]: 33,
  [SYNC_STAGES.PULL]: 66,
  [SYNC_STAGES.PERSIST]: 100,
};
const STAGE_MAX_PROGRESS_INITIAL: StageMaxProgress = {
  [SYNC_STAGES.PUSH]: 33,
  [SYNC_STAGES.PULL]: 100,
};

export interface SyncResult {
  pulledChangesCount?: number;
}

export class ClientSyncManager {
  private static instance: ClientSyncManager | null = null;

  private database: DatatrakDatabase;

  private models: DatatrakWebModelRegistry;

  private deviceId: string;

  private urgentSyncInterval: NodeJS.Timeout | null = null;

  private isInitialSync: boolean = false;

  private syncInterval: NodeJS.Timeout | null = null;

  progressMaxByStage = STAGE_MAX_PROGRESS_INCREMENTAL;

  isRequestingSync: boolean = false;
  isSyncing: boolean = false;
  isQueuing: boolean = false;

  errorMessage: string | null = null;

  lastSuccessfulSyncTime: Date | null = null;

  progress: number | null = null;

  progressMessage: string | null = null;

  syncStage: number | null = null;

  emitter = mitt();

  constructor(models: DatatrakWebModelRegistry, deviceId: string) {
    this.models = models;
    this.database = models.database;
    this.deviceId = deviceId;
    this.progress = 0;
    log.debug('ClientSyncManager.constructor', {
      deviceId,
    });
  }

  static async getInstance(models: DatatrakWebModelRegistry): Promise<ClientSyncManager> {
    if (!ClientSyncManager.instance) {
      const deviceId = await getDeviceId(models);
      ClientSyncManager.instance = new ClientSyncManager(models, deviceId);
    }
    return ClientSyncManager.instance;
  }

  async startSyncService(queryClient: QueryClient): Promise<void> {
    if (this.syncInterval) {
      return;
    }

    await this.waitForCurrentSyncToEnd();

    log.info('Starting sync service');
    const run = async (): Promise<void> => {
      log.info('Running regular sync');
      const { pulledChangesCount } = await this.triggerSync(false);
      if (pulledChangesCount) {
        await queryClient.invalidateQueries();
      }
    };

    // Run the sync immediately
    // and then schedule the next sync
    run();
    this.syncInterval = setInterval(run, SYNC_INTERVAL);
  }

  async stopSyncService(): Promise<void> {
    if (this.syncInterval) {
      log.info('Stopping sync service');
      clearInterval(this.syncInterval);
      await this.waitForCurrentSyncToEnd();
    }

    this.syncInterval = null;
    this.isSyncing = false;
    this.isRequestingSync = false;
    this.isQueuing = false;
    this.progress = 0;
    this.progressMessage = null;
    this.syncStage = null;
    this.lastSuccessfulSyncTime = null;
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

  setSyncStage(syncStage: number | null): void {
    this.syncStage = syncStage;
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED);
  }

  /**
   * Set the current progress (%) and the current progress message for the circular progress bar
   * @param progress
   * @param progressMessage
   */
  setProgress(progress: number, progressMessage: string): void {
    this.progress = progress;
    this.progressMessage = progressMessage;
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED);
  }

  /**
   * Calculate the current progress (%) using the final total and the current records in progress
   * @param total total number of records to process
   * @param progress number of records processed
   * @param progressMessage message to display in the progress bar
   */
  updateProgress = (total: number, progress: number, progressMessage: string): void => {
    const syncStage = ensure(this.syncStage);

    // Get previous stage max progress
    const previousProgress = this.progressMaxByStage[syncStage - 1] ?? 0;
    // Calculate the total progress of the current stage
    const progressDenominator = this.progressMaxByStage[syncStage] - previousProgress;
    // Calculate the progress percentage of the current stage
    // (ie: out of stage 2 which is 33% of the overall progress)
    const currentStagePercentage = Math.min(
      Math.floor((progress / total) * progressDenominator),
      progressDenominator,
    );
    // Add the finished stage progress to get the overall progress percentage
    const progressPercentage = previousProgress + currentStagePercentage;
    this.setProgress(progressPercentage, progressMessage);
  };

  async getProjectsInSync(): Promise<string[]> {
    const syncedProjectsFact = await this.models.localSystemFact.get(FACT_PROJECTS_IN_SYNC);
    const syncedProjectIds = syncedProjectsFact ? JSON.parse(syncedProjectsFact) : [];
    return syncedProjectIds;
  }

  async triggerSync(urgent: boolean = false): Promise<SyncResult> {
    if (this.isSyncing) {
      log.warn('ClientSyncManager.triggerSync(): Tried to start syncing while sync in progress');
      return {};
    }

    try {
      const isOnline = window.navigator.onLine;

      if (!isOnline) {
        throw new Error('No internet connectivity');
      }

      return await this.runSync(urgent);
    } catch (error: any) {
      this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_ERROR, { error: error.message });
      this.errorMessage = error.message;
    } finally {
      // Reset all the values to default only if sync actually started, otherwise they should still be default values
      if (this.isSyncing) {
        this.setProgress(0, '');
        this.syncStage = null;
        this.isSyncing = false;
        this.isRequestingSync = false;
        this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STATE_CHANGED);
        this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_ENDED);
        if (this.urgentSyncInterval) {
          clearInterval(this.urgentSyncInterval);
          this.urgentSyncInterval = null;
        }
        this.progressMessage = null;
      }
    }

    return {};
  }

  /**
   * Trigger urgent sync, and along with urgent sync, schedule regular sync requests
   * to continuously connect to central server and request for status change of the sync session
   */
  async triggerUrgentSync(): Promise<SyncResult> {
    if (this.urgentSyncInterval) {
      log.warn('ClientSyncManager.triggerUrgentSync(): Urgent sync already started');
      return {};
    }

    const urgentSyncIntervalInSeconds = 10;

    // Schedule regular urgent sync
    this.urgentSyncInterval = setInterval(
      () => this.triggerSync(true),
      urgentSyncIntervalInSeconds * 1000,
    );

    // start the sync now
    return await this.triggerSync(true);
  }

  async runSync(urgent: boolean = false): Promise<SyncResult> {
    if (this.isSyncing) {
      throw new Error(
        'It should not be possible to call "runSync" while an existing run is active',
      );
    }

    this.errorMessage = null;
    this.progressMessage = 'Requesting sync...';
    this.isRequestingSync = true;
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_REQUESTING);

    const projectIds = await this.getProjectsInSync();

    if (projectIds.length === 0) {
      log.warn('ClientSyncManager.runSync(): No projects in sync');
      return {};
    }

    this.isRequestingSync = false;
    this.isSyncing = true;

    const pullSince = await getSyncTick(this.models, FACT_LAST_SUCCESSFUL_SYNC_PULL);

    this.isInitialSync = pullSince === -1;

    this.progressMaxByStage = this.isInitialSync
      ? STAGE_MAX_PROGRESS_INITIAL
      : STAGE_MAX_PROGRESS_INCREMENTAL;

    performance.clearMarks();
    performance.clearMeasures();
    performance.mark('startSyncSession');
    const { sessionId, startedAtTick, status } = await this.startSyncSession(urgent, pullSince);

    if (!sessionId) {
      log.debug(`ClientSyncManager.runSync(): Sync queue status: ${status}`);
      this.isSyncing = false;
      this.isQueuing = true;
      this.progressMessage = urgent ? 'Sync in progress...' : 'Sync in queue';
      this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_IN_QUEUE);
      return {};
    }

    this.isSyncing = true;
    this.isQueuing = false;
    this.progressMessage = 'Initialising sync';
    this.emitter.emit(SYNC_EVENT_ACTIONS.SYNC_STARTED);

    // clear previous temp data, in case last session errored out or server was restarted
    await dropAllSnapshotTables(this.database);

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
    await dropSnapshotTable(this.database, sessionId);

    this.lastSuccessfulSyncTime = new Date();

    return { pulledChangesCount };
  }

  async startSyncSession(urgent: boolean, lastSyncedTick: number) {
    for await (const { kind, message } of stream(() => ({
      method: 'POST',
      endpoint: 'sync',
      options: {
        deviceId: this.deviceId,
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
    this.setSyncStage(SYNC_STAGES.PUSH);
    this.setProgress(0, 'Pushing all new changes...');

    // get the sync tick we're up to locally, so that we can store it as the successful push cursor
    const currentSyncClockTime = await getSyncTick(this.models, FACT_CURRENT_SYNC_TICK);

    // use the new unique sync tick for any changes from now on so that any records that are created
    // or updated even mid way through this sync, are marked using the new tick and will be captured
    // in the next push
    await this.models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, newSyncClockTime);
    log.debug('ClientSyncManager.updatedLocalSyncClockTime', { newSyncClockTime });

    await waitForPendingEditsUsingSyncTick(this.database, currentSyncClockTime);

    // syncing outgoing changes happens in two phases: taking a point-in-time copy of all records
    // to be pushed, and then pushing those up in batches
    // this avoids any of the records to be pushed being changed during the push period and
    // causing data that isn't internally coherent from ending up on the central server
    const pushSince = await getSyncTick(this.models, FACT_LAST_SUCCESSFUL_SYNC_PUSH);
    log.debug('ClientSyncManager.snapshotOutgoingChanges', { pushSince });

    // snapshot inside a "repeatable read" transaction, so that other changes made while this snapshot
    // is underway aren't included (as this could lead to a pair of foreign records with the child in
    // the snapshot and its parent missing)
    // as the snapshot only contains read queries, there will be no concurrent update issues :)
    const outgoingChanges = await this.models.wrapInRepeatableReadTransaction(
      async transactingModels => {
        const modelsForPush = getModelsForPush(transactingModels.getModels());
        return snapshotOutgoingChanges(modelsForPush, transactingModels.tombstone, pushSince);
      },
    );

    if (outgoingChanges.length > 0) {
      log.debug('ClientSyncManager.pushingOutgoingChanges', {
        totalPushing: outgoingChanges.length,
      });
      await pushOutgoingChanges(sessionId, outgoingChanges, this.deviceId, (total, pushedRecords) =>
        this.updateProgress(total, pushedRecords, 'Pushing all new changes...'),
      );
    }

    await this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PUSH, currentSyncClockTime);
    log.debug('ClientSyncManager.updatedLastSuccessfulPush', { currentSyncClockTime });
  }

  async pullChanges(sessionId: string, projectIds: string[]): Promise<number> {
    this.setSyncStage(SYNC_STAGES.PULL);

    try {
      log.debug('ClientSyncManager.pullChanges', {
        sessionId,
        projectIds,
      });

      // This is the start of stage 2 which is calling pull/initiate.
      // At this stage, we don't really know how long it will take.
      // So only showing a message to indicate this this is still in progress
      this.setProgress(
        this.progressMaxByStage[SYNC_STAGES.PULL - 1],
        'Pausing at 33% while server prepares for pull, please wait...',
      );

      const pullSince = await getSyncTick(this.models, FACT_LAST_SUCCESSFUL_SYNC_PULL);

      log.debug('ClientSyncManager.createClientSnapshotTable', {
        sessionId,
      });
      await createClientSnapshotTable(this.database, sessionId);

      log.debug('ClientSyncManager.initiatePull', {
        sessionId,
        pullSince,
      });
      const { totalToPull, pullUntil } = await initiatePull(
        sessionId,
        pullSince,
        projectIds,
        this.deviceId,
      );

      this.setProgress(this.progressMaxByStage[SYNC_STAGES.PULL - 1], 'Pulling changes...');

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
      this.updateProgress(totalToPull, totalSaved, `Saving changes (${totalSaved}/${totalToPull})`);
    };

    await this.models.wrapInTransaction(async transactingModels => {
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
      this.updateProgress(totalToPull, pullTotal, `Pulling changes (${pullTotal}/${totalToPull})`);
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
    await pullIncomingChanges(this.models, sessionId, batchSize, processStreamedDataFunction);

    this.setProgress(this.progressMaxByStage[SYNC_STAGES.PERSIST - 1], 'Saving changes...');
    this.setSyncStage(SYNC_STAGES.PERSIST);
    let totalSaved = 0;
    const saveProgressCallback = (incrementalSaved: number) => {
      totalSaved += Number(incrementalSaved);
      this.updateProgress(totalToPull, totalSaved, `Saving changes (${totalSaved}/${totalToPull})`);
    };
    await this.models.wrapInTransaction(async transactingModels => {
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
