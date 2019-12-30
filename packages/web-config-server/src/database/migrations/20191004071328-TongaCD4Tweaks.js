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

const REPORT_COLUMNS = {
  CD4_002: {},
  CD4_003: {},
  CD4_004: {},
  CD4_005: {},
  CD4_006: {},
  CD4_007: {},
  CD4_008: {},
  CD4_009: {},
  CD4_010: {},
  CD4_011: {},
  CD4_012: {},
  CD4_013: {},
  CD4_014: {},
  CD4_015: {},
  CD4_016: {},
  CD4_017: {},
  CD4_018: {},
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "columns": ${JSON.stringify(
        REPORT_COLUMNS,
      )} }'
      WHERE id = 'TO_CD_Validation_CD4';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
