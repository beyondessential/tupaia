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

const reportId = 'WISH_Custom_Export_Surveys';
const oldTransformations = [
  {
    type: 'ancestorMapping',
    ancestorType: 'sub_catchment',
    label: 'Sub Catchment',
    showInExport: true,
  },
  { type: 'transposeMatrix' },
  { type: 'sortByColumns', columns: [['Sub Catchment'], ['Name'], ['Date']] },
];
const newTransformations = [
  {
    type: 'ancestorMapping',
    ancestorType: 'sub_catchment',
    label: 'Sub Catchment',
    showInExport: true,
  },
  { type: 'transposeMatrix' },
  {
    type: 'sortByColumns',
    columns: [['Sub Catchment'], ['What is the household ID?'], ['Name'], ['Date']],
  },
];
const jsonPath = '{exportDataBuilder,dataBuilderConfig,transformations}';

exports.up = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${jsonPath}', '${JSON.stringify(
    newTransformations,
  )}'::jsonb)
  where "id" = '${reportId}';
`);
};

exports.down = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${jsonPath}', '${JSON.stringify(
    oldTransformations,
  )}'::jsonb)
  where "id" = '${reportId}';
`);
};

exports._meta = {
  version: 1,
};
