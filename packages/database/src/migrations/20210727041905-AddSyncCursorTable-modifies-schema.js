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
    CREATE TABLE sync_cursor (
      id TEXT PRIMARY KEY,
      service_name TEXT NOT NULL UNIQUE,
      sync_time TIMESTAMP NOT NULL,
      config JSONB NOT NULL
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE sync_cursor;
  `);
};

exports._meta = {
  version: 1,
};
