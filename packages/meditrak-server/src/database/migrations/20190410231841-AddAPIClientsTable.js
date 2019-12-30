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
    CREATE TABLE api_client (
      id TEXT PRIMARY KEY NOT NULL,
      username TEXT UNIQUE NOT NULL,
      secret_key TEXT NOT NULL,
      user_account_id TEXT REFERENCES user_account(id)
    );
  `);
};

exports.down = function(db) {
  return db.runSql(`
    DROP TABLE api_client;
  `);
};

exports._meta = {
  version: 1,
};
