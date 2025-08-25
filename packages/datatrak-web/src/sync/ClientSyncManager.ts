import winston from 'winston';
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
  withDeferredSyncSafeguards,
} from '@tupaia/sync';
import { SYNC_STREAM_MESSAGE_KIND } from '@tupaia/constants';

import { DatatrakDatabase } from '../database/DatatrakDatabase';
import { initiatePull, pullIncomingChanges } from './pullIncomingChanges';
import { DatatrakWebModelRegistry, ProcessStreamDataParams } from '../types';
import { snapshotOutgoingChanges } from './snapshotOutgoingChanges';
import { pushOutgoingChanges } from './pushOutgoingChanges';
import { insertSnapshotRecords } from './insertSnapshotRecords';
import { remove, stream } from '../api';

export interface SyncResult {
  hasRun: boolean;
  queued: boolean;
}

export class ClientSyncManager {
  private database: DatatrakDatabase;

  private models: DatatrakWebModelRegistry;

  private currentSyncPromise: Promise<SyncResult> | null = null;

  private deviceId: string;

  private userId: string;

  constructor(models: DatatrakWebModelRegistry, deviceId: string, userId: string) {
    this.models = models;
    this.database = models.database;
    this.deviceId = deviceId;
    this.userId = userId;
    winston.debug('ClientSyncManager.constructor', {
      deviceId,
    });
  }

  async triggerSync(projectIds: string[], urgent: boolean) {
    if (this.currentSyncPromise) {
      winston.log('ClientSyncManager.triggerSync - already running');
      return this.currentSyncPromise;
    }

    // set up a common sync promise to avoid double sync
    this.currentSyncPromise = this.runSync(projectIds, urgent);

    // make sure sync promise gets cleared when finished, even if there's an error
    try {
      const result = await this.currentSyncPromise;
      return result;
    } finally {
      this.currentSyncPromise = null;
    }
  }

  async runSync(projectIds: string[], urgent: boolean = false) {
    if (this.currentSyncPromise) {
      throw new Error(
        'It should not be possible to call "runSync" while an existing run is active',
      );
    }

    const lastSyncedTick =
        (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PULL)) || -1;

    const startTime = performance.now();
    const { sessionId, startedAtTick, status } = await this.startSyncSession(urgent, lastSyncedTick);

    if (!sessionId) {
      // we're queued
      winston.debug('ClientSyncManager.wasQueued', { status });
      return { queued: true, hasRun: false };
    }

    // clear previous temp data, in case last session errored out or server was restarted
    await dropAllSnapshotTables(this.database);

    winston.debug('ClientSyncManager.receivedSessionInfo', {
      sessionId,
      startedAtTick,
    });

    await this.pushChanges(sessionId, startedAtTick);

    await this.pullChanges(sessionId, projectIds);

    await this.endSyncSession(sessionId);

    const durationMs = Date.now() - startTime;
    winston.log('ClientSyncManager.completedSession', {
      durationMs,
    });

    // clear temp data stored for persist
    await dropSnapshotTable(this.database, sessionId);

    return { queued: false, hasRun: true };
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
          winston.warn(`Unexpected message kind: ${kind}`);
      }
    }
    throw new Error('Unexpected end of stream');
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
    winston.debug('ClientSyncManager.updatedLocalSyncClockTime', { newSyncClockTime });

    await waitForPendingEditsUsingSyncTick(this.database, currentSyncClockTime);

    // syncing outgoing changes happens in two phases: taking a point-in-time copy of all records
    // to be pushed, and then pushing those up in batches
    // this avoids any of the records to be pushed being changed during the push period and
    // causing data that isn't internally coherent from ending up on the central server
    const pushSince = (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PUSH)) || -1;
    winston.debug('ClientSyncManager.snapshotOutgoingChanges', { pushSince });

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
      winston.debug('ClientSyncManager.pushingOutgoingChanges', {
        totalPushing: outgoingChanges.length,
      });
      await pushOutgoingChanges(sessionId, outgoingChanges, this.deviceId);
    }

    await this.models.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PUSH, currentSyncClockTime);
    winston.debug('ClientSyncManager.updatedLastSuccessfulPush', { currentSyncClockTime });
  }

  async pullChanges(sessionId: string, projectIds: string[]) {
    try {
      winston.debug('ClientSyncManager.pullChanges', {
        sessionId,
      });
      const pullSince =
        (await this.models.localSystemFact.get(FACT_LAST_SUCCESSFUL_SYNC_PULL)) || -1;

      winston.debug('ClientSyncManager.createClientSnapshotTable', {
        sessionId,
      });
      await createClientSnapshotTable(this.database, sessionId);

      winston.debug('ClientSyncManager.initiatePull', {
        sessionId,
        pullSince,
      });
      const { pullUntil } = await initiatePull(
        sessionId,
        pullSince,
        this.userId,
        projectIds,
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
      winston.error('ClientSyncManager.pullChanges', {
        sessionId,
        error,
      });
      throw error;
    }
  }

  async pullInitialSync(sessionId: string, pullUntil: number) {
    await this.models.wrapInTransaction(async transactingModels => {
      const processStreamedDataFunction = async ({ models, records }: ProcessStreamDataParams) => {
        await saveIncomingInMemoryChanges(models, records, false);
      };

      await withDeferredSyncSafeguards(transactingModels.database, () =>
        pullIncomingChanges(transactingModels, sessionId, processStreamedDataFunction),
      );

      // update the last successful sync in the same save transaction - if updating the cursor fails,
      // we want to roll back the rest of the saves so that we don't end up detecting them as
      // needing a sync up to the central server when we attempt to resync from the same old cursor
      winston.debug('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
      return transactingModels.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
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
      const incomingModels = getModelsForPull(transactingModels.getModels());
      await withDeferredSyncSafeguards(transactingModels.database, () =>
        saveIncomingSnapshotChanges(incomingModels, sessionId, false),
      );

      // update the last successful sync in the same save transaction - if updating the cursor fails,
      // we want to roll back the rest of the saves so that we don't end up detecting them as
      // needing a sync up to the central server when we attempt to resync from the same old cursor
      winston.debug('ClientSyncManager.updatingLastSuccessfulSyncPull', { pullUntil });
      return transactingModels.localSystemFact.set(FACT_LAST_SUCCESSFUL_SYNC_PULL, pullUntil);
    });
  }
}
