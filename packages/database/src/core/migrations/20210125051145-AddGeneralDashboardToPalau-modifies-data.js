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

const DASHBOARD_GROUP = {
  organisationLevel: 'Facility',
  userGroup: 'Public',
  organisationUnitCode: 'PW',
  dashboardReports: '{21,22,18,8,5}',
  name: 'General',
  code: 'PW_General_Facility_Public',
  projectCodes: '{explore,disaster,olangch_palau,psss}',
};

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', DASHBOARD_GROUP);
};

exports.down = async function (db) {
  await db.runSql(
    `DELETE FROM "dashboardGroup" 
     WHERE code='PW_General_Facility_Public';`,
  );
};

exports._meta = {
  version: 1,
};
