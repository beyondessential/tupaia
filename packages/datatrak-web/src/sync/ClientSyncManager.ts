import { ModelRegistry } from '@tupaia/database';
import {
  FACT_CURRENT_SYNC_TICK,
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  FACT_LAST_SUCCESSFUL_SYNC_PUSH,
  createClientSnapshotTable,
  dropAllSnapshotTables,
  dropSnapshotTable,
  saveIncomingInMemoryChanges,
  saveIncomingSnapshotChanges,
  waitForPendingEditsUsingSyncTick,
  getModelsForPush,
  getModelsForPull,
} from '@tupaia/sync';
import { DatatrakDatabase } from '../database/DatatrakDatabase';
import { initiatePull, pullIncomingChanges } from './pullIncomingChanges';
import {
  getPullVolumeType,
  PROCESS_STREAM_DATA_FUNCTIONS,
  PullVolumeType,
} from './processStreamedData';
import { post, remove } from '../api';
import { DatatrakWebModelRegistry } from '../types/model';
import { snapshotOutgoingChanges } from './snapshotOutgoingChanges';
import { pushOutgoingChanges } from './pushOutgoingChanges';

export interface SyncResult {
  hasRun: boolean;
}

export class ClientSyncManager {
  private database: DatatrakDatabase;

  private models: DatatrakWebModelRegistry;

  private currentSyncPromise: Promise<SyncResult> | null = null;

  private projectIds: string[];

  private deviceId: string;

  constructor(models: DatatrakWebModelRegistry, projectIds: string[], deviceId: string) {
    this.models = models;
    this.database = models.database;
    this.projectIds = projectIds;
    this.deviceId = deviceId;
  }

  async triggerSync() {
    if (this.currentSyncPromise) {
      return this.currentSyncPromise;
    }

    // set up a common sync promise to avoid double sync
    this.currentSyncPromise = this.runSync();

    // make sure sync promise gets cleared when finished, even if there's an error
    try {
      return this.currentSyncPromise;
    } finally {
      this.currentSyncPromise = null;
    }
  }

  async runSync() {
    if (this.currentSyncPromise) {
      throw new Error(
        'It should not be possible to call "runSync" while an existing run is active',
      );
    }

    const startTime = performance.now();
    const { sessionId, startedAtTick } = await this.startSyncSession();

    // clear previous temp data, in case last session errored out or server was restarted
    await dropAllSnapshotTables(this.database);

    console.log('ClientSyncManager.receivedSessionInfo', {
      sessionId,
      startedAtTick,
    });

    await this.pushChanges(sessionId, startedAtTick);

    // await this.pullChanges(sessionId);

    await this.endSyncSession(sessionId);

    const durationMs = Date.now() - startTime;
    console.log('ClientSyncManager.completedSession', {
      durationMs,
    });

    // clear temp data stored for persist
    await dropSnapshotTable(this.database, sessionId);

    return { hasRun: true };
  }

  async startSyncSession() {
    return post('sync');
  }

  async endSyncSession(sessionId: string) {
    return remove(`sync/${sessionId}`);
  }

  async pushChanges(sessionId: string, newSyncClockTime: number) {
    // get the sync tick we're up to locally, so that we can store it as the successful push cursor
    const currentSyncClockTime = await this.models.localSystemFact.get(FACT_CURRENT_SYNC_TICK);

    // use the new unique sync tick for any changes from now on so that any records that are created
    // or updated even mid way through this sync, are marked using the new tick and will be captured
    // in the next push
    await this.models.localSystemFact.set(FACT_CURRENT_SYNC_TICK, newSyncClockTime);
    console.log('ClientSyncManager.updatedLocalSyncClockTime', { newSyncClockTime });

    await waitForPendingEditsUsingSyncTick(this.database, currentSyncClockTime);

    // syncing outgoing changes happens in two phases: taking a point-in-time copy of all records
    // to be pushed, and then pushing those up in batches
    // this avoids any of the records to be pushed being changed during the push period and
    // causing data that isn't internally coherent from ending up on the central server
    const pushSince = (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PUSH)) || -1;
    console.log('ClientSyncManager.snapshotOutgoingChanges', { pushSince });

    const outgoingChanges = await this.models.wrapInTransaction(async transactingModels => {
      const modelsForPush = getModelsForPush(transactingModels.getModels());
      return snapshotOutgoingChanges(modelsForPush, pushSince);
    }, { isolationLevel: 'repeatable_read' });

    if (outgoingChanges.length > 0) {
      console.log('ClientSyncManager.pushingOutgoingChanges', {
        totalPushing: outgoingChanges.length,
      });
      await pushOutgoingChanges(sessionId, outgoingChanges, this.deviceId);
    }

    await this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PUSH, currentSyncClockTime);
    console.log('ClientSyncManager.updatedLastSuccessfulPush', { currentSyncClockTime });
  }

  async pullChanges(sessionId: string) {
    try {
      console.log('ClientSyncManager.pullChanges', {
        sessionId,
      });
      const pullSince =
        (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PULL)) || -1;

      console.log('ClientSyncManager.createClientSnapshotTable', {
        sessionId,
      });
      await createClientSnapshotTable(this.database, sessionId);

      console.log('ClientSyncManager.initiatePull', {
        sessionId,
      });
      const { totalToPull, pullUntil } = await initiatePull(
        sessionId,
        pullSince,
        this.projectIds,
        this.deviceId,
      );

      // Get the pull volume type to determine how to proces the stream data.
      // 1. If the pull is initial, we wrap the whole pull in a transaction and persist the stream data straight to the actual tables
      //    When leaving a long running transaction open, any user trying to update those same records in Tamanu will be blocked until the sync finishes.
      //    This is not a problem for initial sync because there is no local data, so it is fine to leave a long running transaction open.
      // 2. If the pull is incremental, but higher than a set threshold, we save the stream data to a temporary table and then use a transaction to persist the data to the actual tables
      //    This is because we don't want to block the user from updating the records in Tamanu while a long sync is running.
      //    Also, we don't want to cause memory issues by saving all the data to memory.
      // 3. If the pull is incremental, but lower than a set threshold, we store the stream data in memory and then use a transaction to persist the data to the actual tables
      //    This is because we don't want to block the user from updating the records in Tamanu while a long sync is running.
      //    And since it has low volume of records, it is fine to store all the data in memory.
      const pullVolumeType = getPullVolumeType(pullSince, totalToPull);
      const processStreamedDataFunction = PROCESS_STREAM_DATA_FUNCTIONS[pullVolumeType];

      const runPull = async (models: ModelRegistry) =>
        pullIncomingChanges(models, sessionId, processStreamedDataFunction);

      if (pullVolumeType === PullVolumeType.Initial) {
        return this.models.wrapInTransaction(async transactingModels => {
          await runPull(transactingModels);

          // update the last successful sync in the same save transaction - if updating the cursor fails,
          // we want to roll back the rest of the saves so that we don't end up detecting them as
          // needing a sync up to the central server when we attempt to resync from the same old cursor
          console.log('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
          return this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
        });
      }

      const { totalObjects } = await runPull(this.models);
      return this.models.wrapInTransaction(async transactingModels => {
        const incomingModels = getModelsForPull(transactingModels.getModels());
        if (pullVolumeType === PullVolumeType.IncrementalLow) {
          saveIncomingInMemoryChanges(transactingModels, totalObjects);
        } else if (pullVolumeType === PullVolumeType.IncrementalHigh) {
          saveIncomingSnapshotChanges(incomingModels, sessionId);
        }

        // same reason for wrapping in transaction as in initial sync
        console.log('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
        return this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
      });
    } catch (error) {
      console.error('ClientSyncManager.pullChanges', {
        sessionId,
        error,
      });
      throw error;
    }
  }
}
