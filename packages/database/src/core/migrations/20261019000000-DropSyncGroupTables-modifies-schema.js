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

exports.up = async function (db) {
  /** `sync_group_log` first, as it references `data_service_sync_group(code)` */
  await db.runSql(`
    DROP TABLE IF EXISTS sync_group_log;
    DROP TABLE IF EXISTS data_service_sync_group;
    DROP TYPE IF EXISTS sync_group_sync_status;
  `);
};

/**
 * Recreates the schema only: dropped sync groups and logs are not restored. Notification
 * triggers are reinstated by `runPostMigration`.
 */
exports.down = async function (db) {
  await db.runSql(`
    CREATE TYPE sync_group_sync_status AS ENUM ('IDLE', 'SYNCING', 'ERROR');

    CREATE TABLE data_service_sync_group (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      service_type service_type NOT NULL,
      config JSONB NOT NULL,
      data_group_code TEXT NOT NULL REFERENCES data_group(code) ON DELETE RESTRICT ON UPDATE CASCADE,
      sync_cursor TEXT DEFAULT '1970-01-01T00:00:00.000Z',
      sync_status sync_group_sync_status DEFAULT 'IDLE'
    );

    CREATE TABLE sync_group_log (
      id TEXT PRIMARY KEY,
      sync_group_code TEXT NOT NULL REFERENCES data_service_sync_group(code) ON DELETE RESTRICT ON UPDATE CASCADE,
      service_type service_type NOT NULL,
      log_message TEXT NOT NULL,
      "timestamp" TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('UTC', now())
    );
  `);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
