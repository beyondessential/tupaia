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
    CREATE TABLE sync_service_log (
      id TEXT PRIMARY KEY,
      service_code TEXT NOT NULL,
      service_type service_type NOT NULL,
      log_message TEXT NOT NULL,
      timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'UTC')
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE sync_service_log;
  `);
};

exports._meta = {
  version: 1,
};
