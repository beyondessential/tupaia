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

/** Irreversible: dropped sync groups and logs are not reconstructed. */
exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
