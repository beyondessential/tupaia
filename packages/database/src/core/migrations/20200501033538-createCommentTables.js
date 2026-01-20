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
    CREATE TABLE comment (
      id TEXT PRIMARY KEY,
      user_id text REFERENCES user_account(id),
      created_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      last_modified_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      text TEXT NOT NULL
    );

    CREATE TABLE alert_comment (
      id TEXT PRIMARY KEY,
      alert_id text REFERENCES alert(id) ON UPDATE CASCADE ON DELETE CASCADE,
      comment_id text REFERENCES comment(id) ON UPDATE CASCADE ON DELETE CASCADE
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE alert_comment CASCADE;
    DROP TABLE comment CASCADE;
  `);
};

exports._meta = {
  version: 1,
};
