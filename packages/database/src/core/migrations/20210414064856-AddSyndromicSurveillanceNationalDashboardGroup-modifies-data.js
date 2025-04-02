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

const createDashboardGroup = organisationLevel => ({
  organisationLevel,
  userGroup: 'Public',
  dashboardReports: '{}',
  name: 'Syndromic Surveillance National Data',
  projectCodes: '{psss}',
  organisationUnitCode: 'PW',
  code: `PW_PSSS_Syndromic_Surveillance_National_Data_${organisationLevel}_Public`,
});

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', createDashboardGroup('Country'));
  await insertObject(db, 'dashboardGroup', createDashboardGroup('Facility'));
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
