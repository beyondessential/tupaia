'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = 'sumAllData'
    WHERE id = 'TO_CH_Descriptive_ClinicDressings';
  `);
};

exports.down = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
    SET "dataBuilder" = 'sumLatestData'
    WHERE id = 'TO_CH_Descriptive_ClinicDressings';
  `);
};

exports._meta = {
  version: 1,
};
