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
      CREATE TABLE tombstone
      (
          id                    BIGSERIAL PRIMARY KEY,
          record_id             TEXT NOT NULL,
          record_type           TEXT NOT NULL,
          deleted_at            TIMESTAMP NOT NULL DEFAULT now(),
          updated_at_sync_tick  BIGINT NOT NULL,
          UNIQUE(record_id, record_type)
      );
    `,
  );
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['browser', 'server'],
};
