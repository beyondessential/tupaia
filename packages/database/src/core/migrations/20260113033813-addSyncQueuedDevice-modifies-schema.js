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
    CREATE TABLE sync_queued_device
    (
      id                 TEXT                                   PRIMARY KEY,
      last_seen_time     TIMESTAMP                              NOT NULL DEFAULT now(),
      last_synced_tick   BIGINT                                 NOT NULL,
      urgent             BOOLEAN                                NOT NULL
    );

    CREATE INDEX sync_queued_device_last_seen_time
        ON sync_queued_device (last_seen_time);

    CREATE INDEX sync_queued_device_urgent
        ON sync_queued_device (urgent);
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
