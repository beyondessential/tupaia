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
    CREATE TABLE access_request (
      id TEXT PRIMARY KEY,
      user_id text REFERENCES user_account(id),
      entity_id text REFERENCES entity(id),
      message text,
      project_id text REFERENCES project(id),
      permission_group_id text REFERENCES permission_group(id),
      approved BOOLEAN DEFAULT NULL,
      created_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      processed_by text DEFAULT NULL REFERENCES user_account(id),
      note text DEFAULT NULL,
      processed_date TIMESTAMPTZ DEFAULT NULL
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE access_request CASCADE;
  `);
};

exports._meta = {
  version: 1,
};
