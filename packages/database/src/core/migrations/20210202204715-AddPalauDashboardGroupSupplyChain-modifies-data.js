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

const DASHBOARD_GROUP_COUNTRY = {
  organisationLevel: 'Country',
  userGroup: 'Donor',
  organisationUnitCode: 'PW',
  dashboardReports: '{9,11,6,2,10,12,13,20,3,14,15,7,17}',
  name: 'Supply Chain',
  code: 'PW_Supply_Chain_Country',
  projectCodes: '{olangch_palau}',
};

const DASHBOARD_GROUP_FACILITY = {
  organisationLevel: 'Facility',
  userGroup: 'Donor',
  organisationUnitCode: 'PW',
  dashboardReports: '{9,11,6,2,10,12,13,20,3,14,15,7,17}',
  name: 'Supply Chain',
  code: 'PW_Supply_Chain_Facility',
  projectCodes: '{olangch_palau}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_COUNTRY);
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_FACILITY);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE code = 'PW_Supply_Chain_Country';

    DELETE FROM "dashboardGroup"
    WHERE code = 'PW_Supply_Chain_Facility';
  `);
};

exports._meta = {
  version: 1,
};
