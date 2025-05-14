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
  return db.runSql(`
    CREATE TYPE sync_group_sync_status AS ENUM ('IDLE', 'SYNCING', 'ERROR');
    ALTER TABLE data_service_sync_group ADD COLUMN sync_status sync_group_sync_status DEFAULT 'IDLE';  
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE data_service_sync_group DROP COLUMN sync_status;
    DROP TYPE IF EXISTS sync_group_sync_status;
  `);
};

exports._meta = {
  version: 1,
};
