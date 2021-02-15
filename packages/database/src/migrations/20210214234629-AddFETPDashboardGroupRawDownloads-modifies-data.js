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

const DASHBOARD_GROUP_PG_COUNTRY = {
  organisationLevel: 'Country',
  userGroup: 'Admin',
  organisationUnitCode: 'PG',
  name: 'FETP Raw Data Downloads',
  code: 'PG_FETP_Raw_Data_Downloads_Country',
  projectCodes: '{fetp}',
};

const DASHBOARD_GROUP_SB_COUNTRY = {
  organisationLevel: 'Country',
  userGroup: 'Admin',
  organisationUnitCode: 'SB',
  name: 'FETP Raw Data Downloads',
  code: 'SB_FETP_Raw_Data_Downloads_Country',
  projectCodes: '{fetp}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_PG_COUNTRY);
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP_SB_COUNTRY);
};

exports.down = async function (db) {
  await db.runSql(`
    DELETE FROM "dashboardGroup"
    WHERE code = 'SB_FETP_Raw_Data_Downloads_Country';

    DELETE FROM "dashboardGroup"
    WHERE code = 'PG_FETP_Raw_Data_Downloads_Country';
  `);
};

exports._meta = {
  version: 1,
};
