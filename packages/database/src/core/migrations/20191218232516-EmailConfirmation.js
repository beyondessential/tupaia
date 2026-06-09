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
    CREATE TYPE VERIFIED_EMAIL AS ENUM('unverified', 'new_user', 'verified');
    ALTER TABLE user_account ADD COLUMN verified_email VERIFIED_EMAIL default 'new_user';
    update user_account set verified_email = 'unverified'
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE user_account drop COLUMN verified_email;
    drop TYPE VERIFIED_EMAIL
  `);
};

exports._meta = {
  version: 1,
};
