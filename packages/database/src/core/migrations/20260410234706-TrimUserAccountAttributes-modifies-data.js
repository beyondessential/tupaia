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
  await db.runSql(`
    UPDATE
      user_account
    SET
      first_name = trim(first_name),
      last_name = trim(last_name),
      employer = trim(employer),
      position = trim(position),
      mobile_number = trim(mobile_number)
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
