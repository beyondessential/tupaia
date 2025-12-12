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
    CREATE OR REPLACE FUNCTION add_to_tombstone_on_delete()
      RETURNS trigger
      LANGUAGE plpgsql AS
      $func$
      DECLARE
        current_tick bigint;
      BEGIN
        IF ((SELECT value FROM local_system_fact WHERE key = 'syncTrigger') = 'disabled') THEN
            RETURN NEW;
        END IF;
        -- First get the current sync tick
        SELECT value FROM local_system_fact WHERE key = 'currentSyncTick' INTO current_tick;

        -- Then take an advisory lock on that sync tick value (if one doesn't already exist), to
        -- record that an active transaction is using this sync tick
        -- see waitForPendingEditsUsingSyncTick for more details
        PERFORM pg_try_advisory_xact_lock_shared(current_tick);

        INSERT INTO tombstone (
          record_id,
          record_type,
          deleted_at,
          updated_at_sync_tick
        ) VALUES (
          OLD.id,
          TG_TABLE_NAME,
          NOW(),
          current_tick::BIGINT
        );
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
  targets: ['browser', 'server'],
};
