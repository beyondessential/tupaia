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
          updated_at_sync_tick = current_tick 
        WHERE record_id = OLD.id 
          AND record_type = TG_TABLE_NAME;
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
