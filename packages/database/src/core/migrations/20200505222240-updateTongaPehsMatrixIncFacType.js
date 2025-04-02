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
const REPORT_ID = 'TO_PEHS';
const OLD_VALUE = '"$orgUnit"';
const NEW_VALUE = '"$orgUnitTypeName"';
const JSONPATH = '{columns}';

exports.up = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${JSONPATH}', '${NEW_VALUE}'::jsonb)
  where "id" = '${REPORT_ID}';
`);
};

exports.down = function (db) {
  return db.runSql(`
  update "dashboardReport"
  set "dataBuilderConfig" = jsonb_set("dataBuilderConfig", '${JSONPATH}', '${OLD_VALUE}'::jsonb)
  where "id" = '${REPORT_ID}';
`);
};

exports._meta = {
  version: 1,
};
