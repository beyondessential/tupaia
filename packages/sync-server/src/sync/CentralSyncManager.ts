import log from 'winston';

import {
  getModelsForDirection,
  getSyncTicksOfPendingEdits,
  waitForPendingEditsUsingSyncTick,
  createSnapshotTable,
  countSyncSnapshotRecords,
  completeSyncSession,
  FACT_CURRENT_SYNC_TICK,
  FACT_LOOKUP_UP_TO_TICK,
  SYNC_LOOKUP_PLACEHOLDER_SYNC_TICK,
  SYNC_DIRECTIONS,
  DEBUG_LOG_TYPES,
  SYNC_SESSION_DIRECTION,
} from '@tupaia/sync';
import { generateId, SyncSessionRecord, TupaiaDatabase } from '@tupaia/database';

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
import { objectIdToTimestamp } from '@tupaia/server-utils';
import { snapshotOutgoingChanges } from './snapshotOutgoingChanges';

const errorMessageFromSession = (session: SyncSessionRecord) =>
  `Sync session '${session.id}' encountered an error: ${session.errors[session.errors.length - 1]}`;

export class CentralSyncManager {
  database: TupaiaDatabase;

  models: SyncServerModelRegistry;

  config: SyncServerConfig;

  constructor(models: SyncServerModelRegistry) {
    this.database = models.database;
    this.models = models;

    // TODO: Move this to a config model
    this.config = {
      maxRecordsPerSnapshotChunk: 10000,
      lookupTable: {
        perModelUpdateTimeoutMs: 1000000,
        avoidRepull: false,
      },
      snapshotTransactionTimeoutMs: 10 * 60 * 1000,
      syncSessionTimeoutMs: 20 * 60 * 1000,
      maxConcurrentSessions: 4,
    };
  }

  async tickTockGlobalClock(): Promise<GlobalClockResult> {
    // rather than just incrementing by one tick, we "tick, tock" the clock so we guarantee the
    // "tick" part to be unique to the requesting client, and any changes made directly on the
    // central server will be recorded as updated at the "tock", avoiding any direct changes
    // (e.g. imports) being missed by a client that is at the same sync tick
    const tock = await this.models.localSystemFact.incrementValue(FACT_CURRENT_SYNC_TICK, 2);
    return { tick: tock - 1, tock };
  }

  async getIsSyncCapacityFull() {
    const { maxConcurrentSessions } = this.config;
    const activeSyncs = await this.models.syncSession.find({
      completed_at: null,
      errors: null,
    });
    return activeSyncs.length >= maxConcurrentSessions;
  }

  async startSession(debugInfo = {}): Promise<StartSessionResult> {
    // as a side effect of starting a new session, cause a tick on the global sync clock
    // this is a convenient way to tick the clock, as it means that no two sync sessions will
    // happen at the same global sync time, meaning there's no ambiguity when resolving conflicts

    const sessionId = generateId();
    const startTime = new Date();

    const unmarkSessionAsProcessing = await this.markSessionAsProcessing(sessionId);
    const syncSession = await this.models.syncSession.create({
      id: sessionId,
      startTime,
      lastConnectionTime: startTime,
      debugInfo,
    });

    // no await as prepare session (especially the tickTockGlobalClock action) might get blocked
    // and take a while if the central server is concurrently persisting records from another client.
    // Client should poll for the result later.
    this.prepareSession(syncSession).finally(unmarkSessionAsProcessing);

    log.info('CentralSyncManager.startSession', {
      sessionId: syncSession.id,
      ...debugInfo,
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
      session.updatedAt - session.createdAt > syncSessionTimeoutMs
    ) {
      await session.markErrored(`Sync session ${sessionId} timed out`);
    }

    if (session.errors) {
      throw new Error(errorMessageFromSession(session));
    }
    if (session.completedAt) {
      throw new Error(`Sync session '${sessionId}' is already completed`);
    }
    session.lastConnectionTime = Date.now();
    await session.save();

    return session;
  }

  async fetchSyncMetadata(sessionId: string): Promise<SyncSessionMetadata> {
    // Minimum metadata info for now but can grow in the future
    const session = await this.connectToSession(sessionId);
    return { startedAtTick: session.started_at_tick };
  }

  async prepareSession(syncSession: SyncSessionRecord): Promise<PrepareSessionResult | void> {
    try {
      await createSnapshotTable(this.database, syncSession.id);
      const { tick } = await this.tickTockGlobalClock();
      await syncSession.markAsStartedAt(tick);

      return { sessionId: syncSession.id, tick };
    } catch (error: any) {
      log.error('CentralSyncManager.prepareSession encountered an error', error);
      await this.models.syncSession.markSessionErrored(syncSession.id, error.message);
    }
  }

  // set pull filter begins creating a snapshot of changes to pull at this point in time
  async initiatePull(
    sessionId: string,
    params: SnapshotParams,
  ): Promise<PullInitiationResult | void> {
    try {
      await this.connectToSession(sessionId);

      // first check if the snapshot is already being processed, to throw a sane error if (for some
      // reason) the client managed to kick off the pull twice (ran into this in v1.24.0 and v1.24.1)
      const isAlreadyProcessing = await this.checkSessionIsProcessing(sessionId);
      if (isAlreadyProcessing) {
        throw new Error(`Snapshot for session ${sessionId} is already being processed`);
      }

      const unmarkSessionAsProcessing = await this.markSessionAsProcessing(sessionId);
      this.setupSnapshotForPull(sessionId, params, unmarkSessionAsProcessing); // don't await, as it takes a while - the sync client will poll for it to finish
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
      await session.markErrored(
        'Session initiation incomplete, likely because the central server restarted during the process',
      );
      throw new Error(errorMessageFromSession(session));
    }

    // session ready!
    return true;
  }

  async setupSnapshotForPull(
    sessionId: string,
    snapshotParams: SnapshotParams,
    unmarkSessionAsProcessing: () => Promise<void>,
  ): Promise<void> {
    const { since, projectIds, deviceId } = snapshotParams;
    let transactionTimeout;
    try {
      const session = await this.connectToSession(sessionId);

      // will wait for concurrent snapshots to complete if we are currently at capacity, then
      // set the snapshot_started_at timestamp before we proceed with the heavy work below
      // await startSnapshotWhenCapacityAvailable(sequelize, sessionId);

      // get a sync tick that we can safely consider the snapshot to be up to (because we use the
      // "tick" of the tick-tock, so we know any more changes on the server, even while the snapshot
      // process is ongoing, will have a later updated_at_sync_tick)
      const { tick } = await this.tickTockGlobalClock();

      await this.waitForPendingEdits(tick);

      await this.models.syncSession.update(
        { id: sessionId },
        { pull_since: since, pull_until: tick },
      );

      // snapshot inside a "repeatable read" transaction, so that other changes made while this
      // snapshot is underway aren't included (as this could lead to a pair of foreign records with
      // the child in the snapshot and its parent missing)
      // as the snapshot only contains read queries plus writes to the specific sync snapshot table
      // that it controls, there should be no concurrent update issues :)
      await this.database.wrapInTransaction(async (database: TupaiaDatabase) => {
        const { snapshotTransactionTimeoutMs } = this.config;
        if (snapshotTransactionTimeoutMs) {
          transactionTimeout = setTimeout(() => {
            throw new Error(`Snapshot for session ${sessionId} timed out`);
          }, snapshotTransactionTimeoutMs);
        }

        // full changes
        await snapshotOutgoingChanges(
          database,
          this.models,
          since,
          sessionId,
          deviceId,
          projectIds,
          this.config,
        );
      });
      // this update to the session needs to happen outside of the transaction, as the repeatable
      // read isolation level can suffer serialization failures if a record is updated inside and
      // outside the transaction, and the session is being updated to show the last connection
      // time throughout the snapshot process
      session.snapshot_completed_at = new Date();
      await session.save();
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
    const transactionDatabase = await this.database.createTransaction();
    const result = await transactionDatabase.executeSql(
      'SELECT pg_advisory_xact_lock(:sessionLockId);',
      {
        sessionLockId: objectIdToTimestamp(sessionId),
      },
    );
    const unmarkSessionAsProcessing = async () => {
      await transactionDatabase.commitTransaction();
    };
    return unmarkSessionAsProcessing;
  }

  async checkSessionIsProcessing(sessionId: string): Promise<boolean> {
    const [{ session_is_processing: sessionIsProcessing }] = (await this.database.executeSql(
      'SELECT NOT(pg_try_advisory_xact_lock(:sessionLockId)) AS session_is_processing;',
      {
        sessionLockId: objectIdToTimestamp(sessionId),
      },
    )) as SessionIsProcessingResponse[];

    return sessionIsProcessing;
  }

  async waitForPendingEdits(tick: number): Promise<void> {
    // get all the ticks (ie: keys of in-flight transaction advisory locks) of previously pending edits
    const pendingSyncTicks = (await getSyncTicksOfPendingEdits(this.database)).filter(
      (t: number) => t < tick,
    );

    // wait for any in-flight transactions of pending edits
    // so that we don't miss any changes that are in progress
    await Promise.all(
      pendingSyncTicks.map((t: number) => waitForPendingEditsUsingSyncTick(this.database, t)),
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
      // process is ongoing, will have a later updated_at_sync_tick)
      const { tick: currentTick } = await this.tickTockGlobalClock();

      await this.waitForPendingEdits(currentTick);

      const previouslyUpToTick =
        (await this.models.localSystemFact.get(FACT_LOOKUP_UP_TO_TICK)) || -1;

      await debugObject.addInfo({ since: previouslyUpToTick });

      const isInitialBuildOfLookupTable = Number.parseInt(previouslyUpToTick, 10) === -1;

      await this.database.wrapInTransaction(async (database: TupaiaDatabase) => {
        // When it is initial build of sync lookup table, by setting it to null,
        // it will get the updated_at_sync_tick from the actual tables.
        // Otherwise, update it to SYNC_LOOKUP_PLACEHOLDER_SYNC_TICK so that
        // it can update the flagged ones post transaction commit to the latest sync tick,
        // avoiding sync sessions missing records while sync lookup is being refreshed
        // See more details in the 'await updateSyncLookupPendingRecords' call
        const syncLookupTick = isInitialBuildOfLookupTable
          ? null
          : SYNC_LOOKUP_PLACEHOLDER_SYNC_TICK;

        void (await updateLookupTable(
          getModelsForDirection(this.models, SYNC_DIRECTIONS.PULL_FROM_CENTRAL),
          previouslyUpToTick,
          this.config,
          syncLookupTick,
          debugObject,
        ));

        // update the last successful lookup table in the same transaction - if updating the cursor fails,
        // we want to roll back the rest of the saves so that the next update can still detect the records that failed
        // to be updated last time
        log.debug('CentralSyncManager.updateLookupTable()', {
          lastSuccessfulLookupTableUpdate: currentTick,
        });
        await this.models.localSystemFact.set(FACT_LOOKUP_UP_TO_TICK, currentTick);
      });

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
      // 1. When starting updating lookup table, use fixed -1 as the tick and treat them as pending updates (SYNC_LOOKUP_PLACEHOLDER_SYNC_TICK)
      // 2. After updating lookup table is finished, update all the records with tick = -1 to the latest sync tick
      // => That way, sync sessions will never miss any records due to timing issue.
      // Note: We do not need to update pending records when it is the initial build
      // because it uses ticks from the actual tables for updated_at_sync_tick
      if (!isInitialBuildOfLookupTable) {
        await this.database.wrapInTransaction(async (database: TupaiaDatabase) => {
          // Wrap inside transaction so that any writes to currentSyncTick
          // will have to wait until this transaction is committed
          const { tick: currentTick } = await this.tickTockGlobalClock();
          await updateSyncLookupPendingRecords(database, currentTick);
        });
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

  async endSession(sessionId: string): Promise<void> {
    const session = await this.connectToSession(sessionId);
    const durationMs = Date.now() - session.startTime;
    log.debug('CentralSyncManager.completingSession', { sessionId, durationMs });
    await completeSyncSession(this.models.syncSession, this.database, sessionId);
    log.info('CentralSyncManager.completedSession', {
      sessionId,
      durationMs,
      facilityIds: session.debugInfo.facilityIds,
      deviceId: session.debugInfo.deviceId,
    });
  }
}
