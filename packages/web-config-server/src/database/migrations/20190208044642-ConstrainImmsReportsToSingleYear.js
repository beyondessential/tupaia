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
    SET "viewJson" = "viewJson" || '{"periodGranularity": "one_year_at_a_time"}'
    WHERE "id" IN ('TO_RH_Descriptive_IMMS01_02', 'TO_RH_Descriptive_IMMS01_03', 'TO_RH_Descriptive_IMMS_Coverage');
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
