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
   UPDATE dashboard_relation
   SET permission_groups = '{"Tonga Community Health Senior"}'
   WHERE permission_groups = '{"Community Health Senior"}';
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
