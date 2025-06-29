import { SyncDirections } from '@tupaia/constants';
import {
  FACT_LAST_SUCCESSFUL_SYNC_PULL,
  createClientSnapshotTable,
  dropAllSnapshotTables,
  dropSnapshotTable,
  getModelsForDirection,
  saveIncomingInMemoryChanges,
  saveIncomingSnapshotChanges,
} from '@tupaia/sync';

import { DatatrakDatabase } from '../database/DatatrakDatabase';
import { initiatePull, pullIncomingChanges } from './pullIncomingChanges';
import { post, remove } from '../api';
import { insertSnapshotRecords } from './insertSnapshotRecords';
import { DatatrakWebModelRegistry, ProcessStreamDataParams } from '../types';

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
      const result = await this.currentSyncPromise;
      return result;
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

    await this.pushChanges();

    await this.pullChanges(sessionId);

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

  async pushChanges() {
    // TODO: Implement
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
      const { pullUntil } = await initiatePull(
        sessionId,
        pullSince,
        this.projectIds,
        this.deviceId,
      );

      const isInitialPull = pullSince === -1;

      // 1. If the pull is initial, we wrap the whole pull in a transaction and persist the stream data straight to the actual tables
      //    When leaving a long running transaction open, any user trying to update those same records in Tamanu will be blocked until the sync finishes.
      //    This is not a problem for initial sync because there is no local data, so it is fine to leave a long running transaction open.
      // 2. If the pull is incremental, we save the stream data to a temporary snapshot table and then use a transaction to persist the data to the actual tables
      //    This is because we don't want to block the user from updating the records in Tamanu while a long sync is running.
      //    Also, we don't want to cause memory issues by saving all the data to memory.
      if (isInitialPull) {
        await this.pullInitialSync(sessionId, pullUntil);
      } else {
        await this.pullIncrementalSync(sessionId, pullUntil);
      }
    } catch (error) {
      console.error('ClientSyncManager.pullChanges', {
        sessionId,
        error,
      });
      throw error;
    }
  }

  async pullInitialSync(sessionId: string, pullUntil: number) {
    await this.models.wrapInTransaction(async transactingModels => {
      const processStreamedDataFunction = async ({ models, records }: ProcessStreamDataParams) => {
        await saveIncomingInMemoryChanges(models, records);
      };

      await pullIncomingChanges(transactingModels, sessionId, processStreamedDataFunction);

      // update the last successful sync in the same save transaction - if updating the cursor fails,
      // we want to roll back the rest of the saves so that we don't end up detecting them as
      // needing a sync up to the central server when we attempt to resync from the same old cursor
      console.log('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
      return this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
    });
  }

  async pullIncrementalSync(sessionId: string, pullUntil: number) {
    const processStreamedDataFunction = async ({
      models,
      sessionId,
      records,
    }: ProcessStreamDataParams) => {
      await insertSnapshotRecords(models.database, sessionId, records);
    };

    await pullIncomingChanges(this.models, sessionId, processStreamedDataFunction);

    await this.models.wrapInTransaction(async transactingModels => {
      const incomingModels = getModelsForDirection(
        transactingModels,
        SyncDirections.PULL_FROM_CENTRAL,
      );
      await saveIncomingSnapshotChanges(incomingModels, sessionId);

      // update the last successful sync in the same save transaction - if updating the cursor fails,
      // we want to roll back the rest of the saves so that we don't end up detecting them as
      // needing a sync up to the central server when we attempt to resync from the same old cursor
      console.log('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
      return this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
    });
  }
}
