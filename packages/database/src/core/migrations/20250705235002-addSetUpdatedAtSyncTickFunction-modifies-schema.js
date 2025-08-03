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
    CREATE OR REPLACE FUNCTION set_updated_at_sync_tick()
      RETURNS trigger
      LANGUAGE plpgsql AS
      $func$
      DECLARE
        current_tick bigint;
      BEGIN
        IF ((SELECT value FROM local_system_fact WHERE key = 'syncTrigger') = 'disabled') THEN
            RETURN NEW;
        END IF;
        -- If setting to "-1" representing "not marked as updated on this client", we actually use
        -- a different number, "-999", to represent that in the db, so that we can identify the
        -- difference between explicitly setting it to not marked as updated (when NEW contains -1),
        -- and having other fields updated without the updated_at_sync_tick being altered (in which
        -- case NEW will contain -999, easily distinguished from -1)
        IF NEW.updated_at_sync_tick = -1 THEN
          NEW.updated_at_sync_tick := -999;
        ELSE
           -- First get the current sync tick
          SELECT value FROM local_system_fact WHERE key = 'currentSyncTick' INTO current_tick;
          
          -- Then take an advisory lock on that sync tick value (if one doesn't already exist), to
          -- record that an active transaction is using this sync tick
          -- see waitForPendingEditsUsingSyncTick for more details
          PERFORM pg_try_advisory_xact_lock_shared(current_tick);
          
          -- Finally assign the locked sync tick to the record
          NEW.updated_at_sync_tick := current_tick;
        END IF;
        RETURN NEW;
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
