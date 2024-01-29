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
    ALTER TABLE api_client DROP COLUMN secret_key_hash;
    ALTER TABLE api_client ALTER COLUMN user_account_id SET NOT NULL;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
