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

    // TODO: Move this to a config model RN-1668
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

  async startSession(debugInfo = {}): Promise<StartSessionResult> {
    // as a side effect of starting a new session, cause a tick on the global sync clock
    // this is a convenient way to tick the clock, as it means that no two sync sessions will
    // happen at the same global sync time, meaning there's no ambiguity when resolving conflicts

    const sessionId = generateId();
    const startTime = new Date();

    const syncSession = await this.models.syncSession.create({
      id: sessionId,
      startTime,
      lastConnectionTime: startTime,
      debugInfo,
    });

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
      projectIds: session.debugInfo.projectIds,
      deviceId: session.debugInfo.deviceId,
    });
  }
}
