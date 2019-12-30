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
  CD2_2: {},
  CD2_3: {},
  CD2_4: {},
  CD2_5: {},
  CD2_6: {},
  CD2_NEW001: {},
  CD2_NEW002: {},
  CD2_NEW003: {},
  CD2_8_A74_9_A54_9: {},
  CD2_9_A74_9_A54_9: {},
  CD2_11_A74_9: {},
  CD2_12_A74_9: {},
  CD2_13_A74_9: {},
  CD2_16_A54_9: {},
  CD2_17_A54_9: {},
  CD2_18_A54_9: {},
  CD2_27_A53_9: {},
  CD2_28_A53_9: {},
  CD2_29_A53_9: {},
  CD2_30_A53_9: {},
  CD2_40_Z21: {},
  CD2_39_Z21: {},
  CD2_41_Z21: {},
  CD2_NEW007_B16_9: {},
  CD2_NEW008_B16_9: {},
  CD2_NEW009_B16_9: {},
};

exports.up = function(db) {
  return db.runSql(`
    UPDATE "dashboardReport"
      SET "dataBuilderConfig" = "dataBuilderConfig" || '{ "columns": ${JSON.stringify(
        REPORT_COLUMNS,
      )} }'
      WHERE id = 'TO_CD_Validation_CD2';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
