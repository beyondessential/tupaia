'use strict';

import { insertObject } from '../utilities/migration';

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

const DASHBOARD_GROUP_DISTRICT = {
  organisationLevel: 'SubDistrict',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{}',
  name: 'Malaria',
  code: 'LAOS_EOC_Malaria_Sub_District',
  projectCodes: '{laos_eoc}',
};

const DASHBOARD_GROUP_FACILITY = {
  organisationLevel: 'Facility',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{}',
  name: 'Malaria',
  code: 'LAOS_EOC_Malaria_Facility',
  projectCodes: '{laos_eoc}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_DISTRICT);
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_FACILITY);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP_DISTRICT.code}';
    DELETE FROM "dashboardGroup" WHERE code = '${DASHBOARD_GROUP_FACILITY.code}';
  `);
};

exports._meta = {
  version: 1,
};
