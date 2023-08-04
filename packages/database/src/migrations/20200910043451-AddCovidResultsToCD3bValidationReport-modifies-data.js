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

/*
  Update TO_PEHS dashboard report columns to $orgUnitTypeName
*/
const reportID = 'TO_CD_Validation_CD3';
const oldAdditionalData = [
  'CD3b_008_A30_9',
  'CD3b_009_A74_9',
  'CD3b_010_A54_9',
  'CD3b_011_A53_9',
  'CD3b_012_Z21',
  'CD3b_013_B16_9',
  'CD3b_014_A01_0',
  'CD3b_014a_A39_9',
];
const newAdditionalData = [
  'CD3b_008_A30_9',
  'CD3b_009_A74_9',
  'CD3b_010_A54_9',
  'CD3b_011_A53_9',
  'CD3b_012_Z21',
  'CD3b_013_B16_9',
  'CD3b_014_A01_0',
  'CD3b_014a_A39_9',
  'CD3b_014b_C19_9',
];
const jsonPath = '{columns,CD3b_007,additionalData}';

exports.up = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${jsonPath}', '${JSON.stringify(
    newAdditionalData,
  )}'::jsonb)
  where "id" = '${reportID}'
  and "drillDownLevel" = '1';
`);
};

exports.down = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${jsonPath}', '${JSON.stringify(
    oldAdditionalData,
  )}'::jsonb)
  where "id" = '${reportID}'
  and "drillDownLevel" = '1';
`);
};
exports._meta = {
  version: 1,
};
