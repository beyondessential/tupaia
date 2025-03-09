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
    SET default_measure = 'Laos_Schools_School_Type', dashboard_group_name = 'Laos Schools'
    WHERE code = 'laos_schools';
  `);
};

exports.down = function (db) {
  return db.runSql(`
    UPDATE project
    SET default_measure = '126,171', dashboard_group_name = 'General'
    WHERE code = 'laos_schools';
  `);
};

exports._meta = {
  version: 1,
};
