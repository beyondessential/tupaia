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
    CREATE OR REPLACE FUNCTION set_updated_at_sync_tick_for_delete()
      RETURNS trigger
      LANGUAGE plpgsql AS
      $func$
      BEGIN
        PERFORM pg_try_advisory_xact_lock_shared(OLD.updated_at_sync_tick);

        INSERT INTO tombstone (
          record_id,
          deleted_at,
          updated_at_sync_tick
        ) VALUES (
          OLD.id,
          NOW(),
          (SELECT value FROM local_system_fact WHERE key = 'currentSyncTick')
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
