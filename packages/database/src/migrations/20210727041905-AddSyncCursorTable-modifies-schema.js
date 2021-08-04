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
    CREATE TABLE sync_service (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      service_type service_type NOT NULL,
      sync_cursor TEXT NOT NULL,
      config JSONB NOT NULL
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE sync_service;
  `);
};

exports._meta = {
  version: 1,
};
