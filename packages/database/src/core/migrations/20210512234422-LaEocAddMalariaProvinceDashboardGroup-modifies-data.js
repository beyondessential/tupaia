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

const dashboardGroup = {
  organisationLevel: 'District',
  userGroup: 'Laos EOC User',
  organisationUnitCode: 'LA',
  dashboardReports: '{Laos_EOC_Malaria_Cases_By_Week_District}',
  name: 'Malaria',
  code: 'LAOS_EOC_Malaria_District',
  projectCodes: '{laos_eoc}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', dashboardGroup);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup" WHERE code = '${dashboardGroup.code}';
  `);
};

exports._meta = {
  version: 1,
};
