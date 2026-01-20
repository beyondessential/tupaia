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
  return db.runSql('DROP TRIGGER IF EXISTS psss_session_trigger ON psss_session;');
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
