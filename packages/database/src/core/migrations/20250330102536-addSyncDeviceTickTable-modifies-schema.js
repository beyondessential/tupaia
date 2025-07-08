'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    CREATE TABLE sync_device_tick (
      id                      TEXT,
      persisted_at_sync_tick  BIGINT NOT NULL PRIMARY KEY,
      device_id               TEXT   NOT NULL,
      created_at              TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW() NOT NULL
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
