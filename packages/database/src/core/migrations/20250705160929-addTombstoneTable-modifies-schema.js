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
  return db.runSql(
    `
      CREATE TABLE tomestone
      (
          id                    VARCHAR(24) PRIMARY KEY,
          record_id             VARCHAR(24) NOT NULL,
          record_type           VARCHAR(24) NOT NULL,
          deleted_at            TIMESTAMPTZ NOT NULL,
          updated_at_sync_tick  BIGINT NOT NULL
      );
    `,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
