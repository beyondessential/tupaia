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
    delete from "map_overlay_group_relation" where child_id in ('WS_COVID_Household_Vaccination_Status');
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
