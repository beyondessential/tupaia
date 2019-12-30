'use strict';

import { insertObject } from '../migrationUtilities';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const insertDashboardGroupsForCountry = async (db, countryCode) => {
  const baseDashboardGroup = {
    userGroup: 'UNFPA',
    dashboardReports: {},
    name: 'UNFPA',
    organisationUnitCode: countryCode,
  };

  await insertObject(db, 'dashboardGroup', {
    ...baseDashboardGroup,
    organisationLevel: 'Country',
    code: `${countryCode}_Unfpa_Country`,
  });
  await insertObject(db, 'dashboardGroup', {
    ...baseDashboardGroup,
    organisationLevel: 'Province',
    code: `${countryCode}_Unfpa_Province`,
  });
  return insertObject(db, 'dashboardGroup', {
    ...baseDashboardGroup,
    organisationLevel: 'Facility',
    code: `${countryCode}_Unfpa_Facility`,
  });
};

exports.up = async function(db) {
  await insertDashboardGroupsForCountry(db, 'WS');
  return insertDashboardGroupsForCountry(db, 'MH');
};

exports.down = function(db) {
  return db.runSql(`DELETE FROM "dashboardGroup" WHERE name = 'UNFPA'`);
};

exports._meta = {
  version: 1,
};
