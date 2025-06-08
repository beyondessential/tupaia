import log from 'winston';

import {
  getModelsForDirection,
  getSyncTicksOfPendingEdits,
  waitForPendingEditsUsingSyncTick,
  FACT_CURRENT_SYNC_TICK,
  FACT_LOOKUP_UP_TO_TICK,
  SYNC_TICK_FLAGS,
  SYNC_DIRECTIONS,
  DEBUG_LOG_TYPES,
} from '@tupaia/sync';
import { TupaiaDatabase } from '@tupaia/database';

import { updateLookupTable, updateSyncLookupPendingRecords } from './updateLookupTable';
import { SyncServerConfig, SyncServerModelRegistry } from '../types';

export class CentralSyncManager {
  database: TupaiaDatabase;

  models: SyncServerModelRegistry;

  config: SyncServerConfig;

  constructor(database: TupaiaDatabase, models: SyncServerModelRegistry, config: SyncServerConfig) {
    this.database = database;
    this.models = models;
    this.config = config;
  }

  async tickTockGlobalClock() {
    // rather than just incrementing by one tick, we "tick, tock" the clock so we guarantee the
    // "tick" part to be unique to the requesting client, and any changes made directly on the
    // central server will be recorded as updated at the "tock", avoiding any direct changes
    // (e.g. imports) being missed by a client that is at the same sync tick
    const tock = await this.models.localSystemFact.incrementValue(FACT_CURRENT_SYNC_TICK, 2);
    return { tick: tock - 1, tock };
  }

  async waitForPendingEdits(tick: number) {
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

  async updateLookupTable() {
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
        // Otherwise, update it to SYNC_TICK_FLAGS.SYNC_LOOKUP_PLACEHOLDER so that
        // it can update the flagged ones post transaction commit to the latest sync tick,
        // avoiding sync sessions missing records while sync lookup is being refreshed
        // See more details in the 'await updateSyncLookupPendingRecords' call
        const syncLookupTick = isInitialBuildOfLookupTable
          ? null
          : SYNC_TICK_FLAGS.SYNC_LOOKUP_PLACEHOLDER;

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
      // 1. When starting updating lookup table, use fixed -1 as the tick and treat them as pending updates (SYNC_TICK_FLAGS.SYNC_LOOKUP_PLACEHOLDER)
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
}
