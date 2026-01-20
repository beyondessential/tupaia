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
  return await db.runSql(
    `
      CREATE TABLE sync_session
      (
          id                    TEXT PRIMARY KEY,
          start_time            TIMESTAMPTZ,
          last_connection_time  TIMESTAMPTZ,
          snapshot_completed_at TIMESTAMPTZ,
          info                  JSONB,
          completed_at          TIMESTAMPTZ,
          persist_completed_at  TIMESTAMPTZ,
          pull_since            BIGINT,
          pull_until            BIGINT,
          started_at_tick       BIGINT,
          snapshot_started_at   TIMESTAMPTZ,
          errors                TEXT[]
      );

      CREATE INDEX sync_session_completed_at_idx ON sync_session (completed_at);
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
