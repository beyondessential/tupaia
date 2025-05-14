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
    SET dashboard_group_name = 'STRIVE PNG'
    WHERE dashboard_group_name = 'Strive PNG';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE project
    SET dashboard_group_name = 'Strive PNG'
    WHERE dashboard_group_name = 'STRIVE PNG';
  `);
};

exports._meta = {
  version: 1,
};
