'use strict';

import { arrayToDbString, insertObject } from '../utilities/migration';

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

const dashboardGroups = [
  {
    organisationLevel: 'SubDistrict',
    userGroup: 'Laos EOC User',
    organisationUnitCode: 'LA',
    dashboardReports: '{}',
    name: 'Measles',
    code: 'LAOS_EOC_Measles_Sub_District',
    projectCodes: '{laos_eoc}',
  },
  {
    organisationLevel: 'Facility',
    userGroup: 'Laos EOC User',
    organisationUnitCode: 'LA',
    dashboardReports: '{}',
    name: 'Measles',
    code: 'LAOS_EOC_Measles_Facility',
    projectCodes: '{laos_eoc}',
  },
];

exports.up = async function (db) {
  await Promise.all(
    dashboardGroups.map(dashboardGroup => insertObject(db, 'dashboardGroup', dashboardGroup)),
  );
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup" WHERE code in (${arrayToDbString(
      dashboardGroups.map(dbg => dbg.code),
    )});
  `);
};

exports._meta = {
  version: 1,
};
