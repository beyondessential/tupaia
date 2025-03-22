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
  return db.runSql(`ALTER TABLE data_source ALTER COLUMN config SET DEFAULT '{}'`);
};

exports.down = function (db) {
  return db.runSql(`ALTER TABLE data_source ALTER COLUMN config DROP DEFAULT`);
};

exports._meta = {
  version: 1,
};
