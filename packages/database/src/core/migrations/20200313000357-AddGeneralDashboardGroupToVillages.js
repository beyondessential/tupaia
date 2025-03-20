'use strict';

import { insertObject } from '../utilities';

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

const REPORT = {
  id: 'Basic_Data_Village',
  dataBuilder: 'basicDataVillage',
  dataBuilderConfig: {
    programCode: 'SCRF',
  },
  viewJson: {
    name: 'Basic Village Data',
    type: 'view',
    viewType: 'multiValue',
    valueType: 'text',
  },
  dataServices: [{ isDataRegional: true }],
};
const DASHBOARD_GROUP = {
  organisationLevel: 'Village',
  userGroup: 'Public',
  organisationUnitCode: 'World',
  dashboardReports: `{${REPORT.id}}`,
  name: 'General',
  code: 'Public_General_Village',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardReport', REPORT);
  return insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);
};

exports.down = async function (db) {
  await db.runSql(`DELETE FROM "dashboardReport" WHERE id = '${REPORT.id}';`);
  return db.runSql(`DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP.code}';`);
};

exports._meta = {
  version: 1,
};
