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
  await db.runSql('DROP TABLE IF EXISTS user_country_access_attempt;');
};

/**
 * Restores schema only; dropped rows not recoverable. The two indexes could’ve been a single
 * composite index, but this is a faithful recreation.
 */
exports.down = async function (db) {
  await db.runSql(`
    CREATE TABLE user_country_access_attempt (
      id text PRIMARY KEY,
      user_id text NOT NULL REFERENCES user_account(id) ON DELETE CASCADE ON UPDATE CASCADE,
      country_code text NOT NULL
    );
    CREATE INDEX user_country_access_attempt_user_id_idx ON user_country_access_attempt (user_id);
    CREATE INDEX user_country_access_attempt_country_code_idx ON user_country_access_attempt (country_code);
  `);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
