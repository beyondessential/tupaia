import log from 'winston';
import groupBy from 'lodash.groupby';

import {
  getModelsForPull,
  getSyncTicksOfPendingEdits,
  waitForPendingEditsUsingSyncTick,
  createSnapshotTable,
  countSyncSnapshotRecords,
  completeSyncSession,
  startSnapshotWhenCapacityAvailable,
  DEBUG_LOG_TYPES,
  SYNC_SESSION_DIRECTION,
  getModelsForPush,
  saveIncomingSnapshotChanges,
  insertSnapshotRecords,
  updateSnapshotRecords,
  SyncSnapshotAttributes,
  withDeferredSyncSafeguards,
} from '@tupaia/sync';
import { objectIdToTimestamp } from '@tupaia/server-utils';
import { SyncTickFlags, FACT_CURRENT_SYNC_TICK, FACT_LOOKUP_UP_TO_TICK } from '@tupaia/constants';
import { generateId } from '@tupaia/database';
import { SyncServerStartSessionRequest, SyncSession } from '@tupaia/types';
import { AccessPolicy } from '@tupaia/access-policy';

import { updateLookupTable, updateSyncLookupPendingRecords } from './updateLookupTable';
import {
  GlobalClockResult,
  PrepareSessionResult,
  PullInitiationResult,
  PullMetadata,
  SessionIsProcessingResponse,
  SnapshotParams,
  StartSessionResult,
  SyncServerConfig,
  SyncServerModelRegistry,
  SyncSessionMetadata,
  UnmarkSessionAsProcessingFunction,
} from '../types';
import { snapshotOutgoingChanges } from './snapshotOutgoingChanges';
import { removeSnapshotDataByPermissions } from './removeSnapshotDataByPermissions';

const DEFAULT_CONFIG: SyncServerConfig = {
  maxRecordsPerSnapshotChunk: 10_000,
  lookupTable: {
    perModelUpdateTimeoutMs: 1_000_000,
    avoidRepull: false,
  },
  snapshotTransactionTimeoutMs: 10 * 60 * 1000,
  syncSessionTimeoutMs: 20 * 60 * 1000,
  maxConcurrentSessions: 4,
};

const errorMessageFromSession = (session: SyncSession) =>
  `Sync session '${session.id}' encountered an error: ${session.errors?.at(-1)}`;

export class CentralSyncManager {
  models: SyncServerModelRegistry;

  config: SyncServerConfig;

  constructor(
    models: SyncServerModelRegistry,
    overrideConfig: Partial<SyncServerConfig> = DEFAULT_CONFIG,
  ) {
    this.models = models;

    // TODO: Move this to a config model RN-1668
    this.config = {
      ...DEFAULT_CONFIG,
      ...overrideConfig,
    };
  }

  /**
   * @param models - Either this.models or a transaction-wrapped version of this.models.
   * @returns The tick and tock values.
   */
  async tickTockGlobalClock(models: SyncServerModelRegistry): Promise<GlobalClockResult> {
    // rather than just incrementing by one tick, we "tick, tock" the clock so we guarantee the
    // "tick" part to be unique to the requesting client, and any changes made directly on the
    // central server will be recorded as updated at the "tock", avoiding any direct changes
    // (e.g. imports) being missed by a client that is at the same sync tick
    const tock = await models.localSystemFact.incrementValue(FACT_CURRENT_SYNC_TICK, 2);
    return { tick: tock - 1, tock };
  }

  async getIsSyncCapacityFull(): Promise<boolean> {
    const { maxConcurrentSessions } = this.config;
    const activeSyncs = await this.models.syncSession.find({
      completed_at: null,
      errors: null,
    });
    return activeSyncs.length >= maxConcurrentSessions;
  }

  async queueDeviceForSync(deviceId: string, urgent: boolean = false, lastSyncedTick: number = 0) {
    const staleSessions = await this.models.syncSession.find({
      completed_at: null,
      'info->>deviceId': deviceId,
    });

    // Close out stale sessions if they exist
    // (highly likely 0 or 1, but still loop as multiples are still theoretically possible)
    for (const session of staleSessions) {
      await completeSyncSession(
        this.models.syncSession,
        this.models.database,
        session.id,
        'Session marked as completed due to its device reconnecting',
      );
      const durationMs = performance.now() - session.start_time;

      log.info('StaleSyncSessionCleaner.closedReconnectedSession', {
        sessionId: session.id,
        durationMs,
        deviceId: session.info.deviceId,
      });
    }

    // now update our position in the queue and check if we're at the front of it
    const queueRecord = await this.models.syncQueuedDevice.checkSyncRequest({
      lastSyncedTick,
      urgent,
      deviceId,
    });

    log.info('Queue position', {
      lastSyncedTick: queueRecord.last_synced_tick,
      deviceId: queueRecord.id,
      urgent: queueRecord.urgent,
    });

    // if we're not at the front of the queue, we're waiting
    if (queueRecord.id !== deviceId) {
      return {
        status: SyncServerStartSessionRequest.QueueStatus.WaitingInQueue,
        behind: {
          lastSyncedTick: queueRecord.last_synced_tick,
          deviceId: queueRecord.id,
          urgent: queueRecord.urgent,
        },
      };
    }

    // we're at the front of the queue, but if the previous device's sync is still
    // underway we need to wait for that
    const isSyncCapacityFull = await this.getIsSyncCapacityFull();
    if (isSyncCapacityFull) {
      return {
        status: SyncServerStartSessionRequest.QueueStatus.ActiveSync,
      };
    }

    // remove our place in the queue before starting sync
    // (if the resulting sync has an error, we'll be knocked to the back of the queue
    // but that's fine. It will leave some room for non-errored devices to sync, and
    // our requests will get priority once our error resolves as we'll have an older
    // lastSyncedTick)
    await queueRecord.delete();

    const { sessionId } = await this.startSession({
      deviceId,
    });
    return { sessionId };
  }

  async startSession(info = {}): Promise<StartSessionResult> {
    // as a side effect of starting a new session, cause a tick on the global sync clock
    // this is a convenient way to tick the clock, as it means that no two sync sessions will
    // happen at the same global sync time, meaning there's no ambiguity when resolving conflicts

    const sessionId = generateId();
    const startTime = new Date();

    const unmarkSessionAsProcessing = await this.markSessionAsProcessing(sessionId);
    const syncSession = await this.models.syncSession.create({
      id: sessionId,
      start_time: startTime,
      last_connection_time: startTime,
      info,
    });

    // no await as prepare session (especially the tickTockGlobalClock action) might get blocked
    // and take a while if the central server is concurrently persisting records from another client.
    // client should poll for the result later.
    this.prepareSession(sessionId).finally(unmarkSessionAsProcessing);

    log.info('CentralSyncManager.startSession', {
      sessionId: syncSession.id,
      ...info,
    });

    return { sessionId: syncSession.id };
  }

  async connectToSession(sessionId: string) {
    const session = await this.models.syncSession.findById(sessionId);

    if (!session) {
      throw new Error(`Sync session '${sessionId}' not found`);
    }

    const { syncSessionTimeoutMs } = this.config;
    if (
      syncSessionTimeoutMs &&
      !session.errors &&
      session.last_connection_time - session.start_time > syncSessionTimeoutMs
    ) {
      await this.models.syncSession.markSessionErrored(
        sessionId,
        `Sync session ${sessionId} timed out after ${syncSessionTimeoutMs} ms`,
      );
    }

    if (session.errors) {
      throw new Error(errorMessageFromSession(session));
    }
    if (session.completed_at) {
      throw new Error(`Sync session '${sessionId}' is already completed`);
    }

    await this.models.syncSession.updateById(sessionId, { last_connection_time: new Date() });

    return session;
  }

  async fetchSyncMetadata(sessionId: string): Promise<SyncSessionMetadata> {
    // Minimum metadata info for now but can grow in the future
    const session = await this.connectToSession(sessionId);
    return { startedAtTick: session.started_at_tick };
  }

  async prepareSession(sessionId: string): Promise<PrepareSessionResult | void> {
    try {
      await createSnapshotTable(this.models.database, sessionId);
      const { tick } = await this.tickTockGlobalClock(this.models);
      await this.models.syncSession.updateById(sessionId, { started_at_tick: tick });

      return { sessionId, tick };
    } catch (error: any) {
      log.error('CentralSyncManager.prepareSession encountered an error', error);
      await this.models.syncSession.markSessionErrored(sessionId, error.message);
    }
  }

  // set pull filter begins creating a snapshot of changes to pull at this point in time
  async initiatePull(
    sessionId: string,
    params: SnapshotParams,
    accessPolicy: AccessPolicy,
  ): Promise<PullInitiationResult | void> {
    try {
      if (params.projectIds?.length === 0) {
        throw new Error('No project IDs provided');
      }

      await this.connectToSession(sessionId);

      // first check if the snapshot is already being processed, to throw a sane error if (for some
      // reason) the client managed to kick off the pull twice
      const isAlreadyProcessing = await this.checkSessionIsProcessing(sessionId);
      if (isAlreadyProcessing) {
        throw new Error(`Snapshot for session ${sessionId} is already being processed`);
      }

      const unmarkSessionAsProcessing = await this.markSessionAsProcessing(sessionId);
      this.setupSnapshotForPull(sessionId, params, unmarkSessionAsProcessing, accessPolicy); // don't await, as it takes a while - the sync client will poll for it to finish
    } catch (error: any) {
      log.error('CentralSyncManager.initiatePull encountered an error', error);
      await this.models.syncSession.markSessionErrored(sessionId, error.message);
    }
  }

  async checkSessionReady(sessionId: string): Promise<boolean> {
    // if this session is still initiating, return false to tell the client to keep waiting
    const sessionIsInitiating = await this.checkSessionIsProcessing(sessionId);
    if (sessionIsInitiating) {
      return false;
    }

    // if this session is not marked as processing, but also never set startedAtTick, record an error
    const session = await this.connectToSession(sessionId);
    if (session.started_at_tick === null) {
      await this.models.syncSession.markSessionErrored(
        sessionId,
        'Session initiation incomplete, likely because the central server restarted during the process',
      );
      throw new Error(errorMessageFromSession(session));
    }

    // session ready!
    return true;
  }

  async checkPullReady(sessionId: string): Promise<boolean> {
    await this.connectToSession(sessionId);

    // if this snapshot still processing, return false to tell the client to keep waiting
    const snapshotIsProcessing = await this.checkSessionIsProcessing(sessionId);
    if (snapshotIsProcessing) {
      return false;
    }

    // if this snapshot is not marked as processing, but also never completed, record an error
    const session = await this.connectToSession(sessionId);
    if (session.snapshot_completed_at === null) {
      await this.models.syncSession.markSessionErrored(
        sessionId,
        'Snapshot processing incomplete, likely because the central server restarted during the snapshot',
      );
      throw new Error(errorMessageFromSession(session));
    }

    // snapshot processing complete!
    return true;
  }

  async fetchPullMetadata(sessionId: string): Promise<PullMetadata> {
    const session = await this.connectToSession(sessionId);
    const totalToPull = await countSyncSnapshotRecords(
      this.models.database,
      sessionId,
      SYNC_SESSION_DIRECTION.OUTGOING,
    );
    await this.models.syncSession.addInfo(sessionId, { totalToPull });
    const { pull_until: pullUntil } = session;
    return { totalToPull, pullUntil };
  }

  async setupSnapshotForPull(
    sessionId: string,
    snapshotParams: SnapshotParams,
    unmarkSessionAsProcessing: () => Promise<void>,
    accessPolicy: AccessPolicy,
  ): Promise<void> {
    const { since, projectIds, deviceId } = snapshotParams;
    let transactionTimeout;
    try {
      await this.connectToSession(sessionId);

      if (!snapshotParams.projectIds?.length) {
        throw new Error('Project IDs are required');
      }

      await this.models.syncSession.addInfo(sessionId, { projectIds });

      // will wait for concurrent snapshots to complete if we are currently at capacity, then
      // set the snapshot_started_at timestamp before we proceed with the heavy work below
      await startSnapshotWhenCapacityAvailable(this.models.database, sessionId);

      // get a sync tick that we can safely consider the snapshot to be up to (because we use the
      // "tick" of the tick-tock, so we know any more changes on the server, even while the snapshot
      // process is ongoing, will have a later updated_at_sync_tick, i.e. the "tock")
      const { tick } = await this.tickTockGlobalClock(this.models);

      await this.waitForPendingEdits(tick);

      await this.models.syncSession.updateById(sessionId, { pull_since: since, pull_until: tick });

      // snapshot inside a "repeatable read" transaction, so that other changes made while this
      // snapshot is underway aren't included (as this could lead to a pair of foreign records with
      // the child in the snapshot and its parent missing)
      // as the snapshot only contains read queries plus writes to the specific sync snapshot table
      // that it controls, there should be no concurrent update issues :)
      await this.models.wrapInRepeatableReadTransaction(
        async (transactingModels: SyncServerModelRegistry) => {
          const { snapshotTransactionTimeoutMs } = this.config;
          if (snapshotTransactionTimeoutMs) {
            transactionTimeout = setTimeout(() => {
              throw new Error(`Snapshot for session ${sessionId} timed out`);
            }, snapshotTransactionTimeoutMs);
          }

          // full changes
          await snapshotOutgoingChanges(
            transactingModels.database,
            getModelsForPull(transactingModels.getModels()),
            since,
            sessionId,
            deviceId,
            projectIds,
            this.config,
          );

          await removeSnapshotDataByPermissions(
            sessionId,
            transactingModels.database,
            getModelsForPull(transactingModels.getModels()),
            accessPolicy,
          );
        },
      );
      // this update to the session needs to happen outside of the transaction, as the repeatable
      // read isolation level can suffer serialization failures if a record is updated inside and
      // outside the transaction, and the session is being updated to show the last connection
      // time throughout the snapshot process
      await this.models.syncSession.updateById(sessionId, { snapshot_completed_at: new Date() });
    } catch (error: any) {
      log.error('CentralSyncManager.setupSnapshotForPull encountered an error', {
        sessionId,
        error: error.message,
      });
      await this.models.syncSession.markSessionErrored(sessionId, error.message);
    } finally {
      if (transactionTimeout) {
        clearTimeout(transactionTimeout);
      }
      await unmarkSessionAsProcessing();
    }
  }

  async markSessionAsProcessing(sessionId: string): Promise<UnmarkSessionAsProcessingFunction> {
    // Mark the session as processing something asynchronous in a way that
    // a) can be read across processes, if the central server is running in cluster mode; and
    // b) will automatically get cleared if the process restarts
    // A transaction level advisory lock fulfils both of these criteria, as it sits at the database
    // level (independent of an individual node process), but will be unlocked if the transaction is
    // rolled back for any reason (e.g. the server restarts)
    const transactionDatabase = await this.models.database.createTransaction();
    await transactionDatabase.executeSql('SELECT pg_advisory_xact_lock(:sessionLockId);', {
      sessionLockId: objectIdToTimestamp(sessionId),
    });
    const unmarkSessionAsProcessing = async () => {
      await transactionDatabase.commitTransaction();
    };
    return unmarkSessionAsProcessing;
  }

  async checkSessionIsProcessing(sessionId: string): Promise<boolean> {
    const [{ session_is_processing: sessionIsProcessing }] = (await this.models.database.executeSql(
      'SELECT NOT(pg_try_advisory_xact_lock(:sessionLockId)) AS session_is_processing;',
      {
        sessionLockId: objectIdToTimestamp(sessionId),
      },
    )) as SessionIsProcessingResponse[];

    return sessionIsProcessing;
  }

  async waitForPendingEdits(tick: number): Promise<void> {
    // get all the ticks (ie: keys of in-flight transaction advisory locks) of previously pending edits
    const pendingSyncTicks = (await getSyncTicksOfPendingEdits(this.models.database)).filter(
      (t: number) => t < tick,
    );

    // wait for any in-flight transactions of pending edits
    // so that we don't miss any changes that are in progress
    await Promise.all(
      pendingSyncTicks.map((t: number) =>
        waitForPendingEditsUsingSyncTick(this.models.database, t),
      ),
    );
  }

  async updateLookupTable(): Promise<void> {
    const debugObject = await this.models.debugLog.create({
      type: DEBUG_LOG_TYPES.SYNC_LOOKUP_UPDATE,
      info: {
        startedAt: new Date(),
      },
    });

    try {
      // get a sync tick that we can safely consider the snapshot to be up to (because we use the
      // "tick" of the tick-tock, so we know any more changes on the server, even while the snapshot
      // process is ongoing, will have a later updated_at_sync_tick, i.e. the "tock")
      const { tick: currentTick } = await this.tickTockGlobalClock(this.models);

      await this.waitForPendingEdits(currentTick);

      const previouslyUpToTick =
        (await this.models.localSystemFact.get(FACT_LOOKUP_UP_TO_TICK)) || -1;

      await debugObject.addInfo({ since: previouslyUpToTick });

      const isInitialBuildOfLookupTable = Number.parseInt(previouslyUpToTick, 10) === -1;

      const changesCount = await this.models.wrapInRepeatableReadTransaction(
        async (transactingModels: SyncServerModelRegistry) => {
          // When it is initial build of sync lookup table, by setting it to null,
          // it will get the updated_at_sync_tick from the actual tables.
          // Otherwise, update it to SYNC_TICK_FLAGS.SYNC_LOOKUP_PLACEHOLDER so that
          // it can update the flagged ones post transaction commit to the latest sync tick,
          // avoiding sync sessions missing records while sync lookup is being refreshed
          // See more details in the 'await updateSyncLookupPendingRecords' call
          const syncLookupTick = isInitialBuildOfLookupTable
            ? null
            : SyncTickFlags.SYNC_LOOKUP_PLACEHOLDER;

          const updatedCount = await updateLookupTable(
            getModelsForPull(transactingModels.getModels()),
            previouslyUpToTick,
            this.config,
            syncLookupTick,
          );

          // update the last successful lookup table in the same transaction - if updating the cursor fails,
          // we want to roll back the rest of the saves so that the next update can still detect the records that failed
          // to be updated last time
          log.debug('CentralSyncManager.updateLookupTable()', {
            lastSuccessfulLookupTableUpdate: currentTick,
          });
          await transactingModels.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, currentTick);

          return updatedCount;
        },
      );

      await debugObject.addInfo({ changesCount });

      // If we used the current sync tick to record against each update to the sync lookup table, we would hit an edge case:
      // 1. Current sync tick is = 1, encounter A is updated
      // 2. Sync lookup table is being updated, transferring encounter A to sync_lookup, using updated_at_sync_tick = 1
      // 3. New sync session A is started, and current sync tick is incremented to = 3
      // 4. Sync lookup table is still being updated
      // 5. Sync session A is finished, and lastSuccessfulPullTick is set to = 3
      // 6. Sync lookup table is finished. Encounter A is transferred to sync_lookup table
      // 7. Sync session B is started, pulling from lastSuccessfulPullTick = 3, missing encounter A with tick = 1
      //
      // Hence, to fix this, we:
      // 1. When starting updating lookup table, use fixed -1 as the tick and treat them as pending updates (SYNC_TICK_FLAGS.SYNC_LOOKUP_PLACEHOLDER)
      // 2. After updating lookup table IS FINISHED AND COMMITED (hence we wrap in a new transaction),
      // update all the records with tick = -1 to the latest sync tick
      // => That way, sync sessions will never miss any records due to timing issue.
      // Note: We do not need to update pending records when it is the initial build
      // because it uses ticks from the actual tables for updated_at_sync_tick
      if (!isInitialBuildOfLookupTable) {
        await this.models.wrapInRepeatableReadTransaction(
          async (transactingModels: SyncServerModelRegistry) => {
            // Wrap inside transaction so that any writes to currentSyncTick
            // will have to wait until this transaction is committed
            const { tick: currentTick } = await this.tickTockGlobalClock(transactingModels);
            await updateSyncLookupPendingRecords(transactingModels.database, currentTick);
          },
        );
      }
    } catch (error: any) {
      log.error('CentralSyncManager.updateLookupTable encountered an error', {
        error: error.message,
      });

      await debugObject.addInfo({
        error: error.message,
      });

      throw error;
    } finally {
      await debugObject.addInfo({
        completedAt: new Date(),
      });
    }
  }

  async persistIncomingChanges(sessionId: string, deviceId: string) {
    const totalPushed = await countSyncSnapshotRecords(
      this.models.database,
      sessionId,
      SYNC_SESSION_DIRECTION.INCOMING,
    );
    await this.models.syncSession.addInfo(sessionId, {
      beganPersistAt: new Date(),
      totalPushed,
    });

    try {
      // commit the changes to the db
      const persistedAtSyncTick = await this.models.wrapInTransaction(
        async (transactingModels: SyncServerModelRegistry) => {
          const modelsToInclude = getModelsForPush(transactingModels.getModels());

          // we tick-tock the global clock to make sure there is a unique tick for these changes
          // n.b. this used to also be used for concurrency control, but that is now handled by
          // shared advisory locks taken using the current sync tick as the id, which are waited on
          // by an exclusive lock taken prior to starting a snapshot - so this is now purely for
          // saving with a unique tick
          const { tock } = await this.tickTockGlobalClock(transactingModels);

          await withDeferredSyncSafeguards(transactingModels.database, () =>
            saveIncomingSnapshotChanges(modelsToInclude, sessionId, true),
          );

          // store the sync tick on save with the incoming changes, so they can be compared for
          // edits with the outgoing changes
          await updateSnapshotRecords(
            transactingModels.database,
            sessionId,
            { saved_at_sync_tick: tock },
            { direction: SYNC_SESSION_DIRECTION.INCOMING },
          );

          return tock;
        },
      );

      await this.models.syncDeviceTick.create({
        device_id: deviceId,
        persisted_at_sync_tick: persistedAtSyncTick,
      });

      // mark persisted so that client polling "completePush" can stop
      await this.models.syncSession.update({ id: sessionId }, { persist_completed_at: new Date() });

      // WARNING: if you are adding another db call here, you need to either move the
      // persistCompletedAt lower down, or change the check in checkPushComplete
    } catch (error: any) {
      log.error('CentralSyncManager.persistIncomingChanges encountered an error', error);
      await this.models.syncSession.markSessionErrored(sessionId, error.message);
    }
  }

  validateIncomingChanges(changes: SyncSnapshotAttributes[]) {
    const allowedPushTables = getModelsForPush(this.models.getModels()).map(m => m.databaseRecord);
    const incomingTables = Object.keys(groupBy(changes, 'recordType'));
    const invalidTables = incomingTables.filter(t => !allowedPushTables.includes(t));

    if (invalidTables.length > 0) {
      throw new Error(`Invalid tables in incoming changes: ${invalidTables.join(', ')}`);
    }
  }

  async addIncomingChanges(sessionId: string, changes: SyncSnapshotAttributes[]) {
    await this.connectToSession(sessionId);

    this.validateIncomingChanges(changes);

    const incomingSnapshotRecords = changes.map(c => ({
      ...c,
      direction: SYNC_SESSION_DIRECTION.INCOMING,
    }));

    log.debug('CentralSyncManager.addIncomingChanges', {
      incomingSnapshotRecordsCount: incomingSnapshotRecords.length,
      sessionId,
    });
    await insertSnapshotRecords(this.models.database, sessionId, incomingSnapshotRecords);
  }

  async completePush(sessionId: string, deviceId: string) {
    await this.connectToSession(sessionId);

    // don't await persisting, the client should asynchronously poll as it may take longer than
    // the http request timeout
    const unmarkSessionAsProcessing = await this.markSessionAsProcessing(sessionId);
    this.persistIncomingChanges(sessionId, deviceId).finally(unmarkSessionAsProcessing);
  }

  async checkPushComplete(sessionId: string) {
    // if the push is still persisting, return false to tell the client to keep waiting
    const persistIsProcessing = await this.checkSessionIsProcessing(sessionId);
    if (persistIsProcessing) {
      return false;
    }

    // if this session is not marked as processing, but also never set persistCompletedAt, record an error
    const session = await this.connectToSession(sessionId);
    if (session.persist_completed_at === null) {
      await this.models.syncSession.markSessionErrored(
        sessionId,
        'Push persist incomplete, likely because the central server restarted during the process',
      );
      throw new Error(errorMessageFromSession(session));
    }

    // push complete!
    return true;
  }

  async endSession(sessionId: string): Promise<void> {
    const session = await this.connectToSession(sessionId);
    const durationMs = Date.now() - session.start_time;
    log.debug('CentralSyncManager.completingSession', { sessionId, durationMs });
    await completeSyncSession(this.models.syncSession, this.models.database, sessionId);
    log.info('CentralSyncManager.completedSession', {
      sessionId,
      durationMs,
      projectIds: session.info.projectIds,
      deviceId: session.info.deviceId,
    });
  }
}
