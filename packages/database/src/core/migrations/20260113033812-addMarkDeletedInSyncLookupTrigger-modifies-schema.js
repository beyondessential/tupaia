'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
    CREATE OR REPLACE FUNCTION mark_deleted_in_sync_lookup()
      RETURNS trigger
      LANGUAGE plpgsql AS
      $func$
      DECLARE
        current_tick bigint;
      BEGIN
        IF ((SELECT value FROM local_system_fact WHERE key = 'syncTrigger') = 'disabled') THEN
          RETURN OLD;
        END IF;
        -- First get the current sync tick
        SELECT value FROM local_system_fact WHERE key = 'currentSyncTick' INTO current_tick;

        -- Then take an advisory lock on that sync tick value (if one doesn't already exist), to
        -- record that an active transaction is using this sync tick
        -- see waitForPendingEditsUsingSyncTick for more details
        PERFORM pg_try_advisory_xact_lock_shared(current_tick);

        UPDATE sync_lookup 
        SET is_deleted = TRUE, 
          -- Use GREATEST to ensure the sync tick only moves forward: a concurrent
          -- transaction with a higher tick may have already updated this row (from updateLookupTable), 
          -- and blindly setting current_tick would roll it back, causing clients to
          -- miss that later change
          updated_at_sync_tick = GREATEST(current_tick, updated_at_sync_tick)
        WHERE record_id = OLD.id 
          AND record_type = TG_TABLE_NAME;

        -- If the record hasn't been added to sync_lookup yet (e.g. it was recently pushed by
        -- a client and updateLookupTable hasn't processed it), the UPDATE above will match
        -- 0 rows and the deletion would be silently lost. Insert a deletion marker so that
        -- clients who already have this record (because they pushed it) receive the delete.
        IF NOT FOUND THEN
          INSERT INTO sync_lookup (record_id, record_type, data, updated_at_sync_tick, is_deleted)
          VALUES (OLD.id, TG_TABLE_NAME, row_to_json(OLD), current_tick, TRUE)
          ON CONFLICT (record_id, record_type) DO UPDATE SET
            is_deleted = TRUE,
            updated_at_sync_tick = GREATEST(EXCLUDED.updated_at_sync_tick, sync_lookup.updated_at_sync_tick);
        END IF;

        RETURN OLD;
      END
    $func$;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
