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
    UPDATE project
    SET dashboard_group_name = 'Health Promotion Unit'
    WHERE code = 'fanafana';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE project
    SET dashboard_group_name = 'General'
    WHERE code = 'fanafana';
  `);
};

exports._meta = {
  version: 1,
};
