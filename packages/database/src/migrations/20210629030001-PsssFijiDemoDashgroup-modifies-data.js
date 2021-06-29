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

exports.up = async function (db) {
  await insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Facility',
    userGroup: 'PSSS Tupaia',
    organisationUnitCode: 'FJ',
    dashboardReports: {},
    name: 'Syndromic Surveillance National Data',
    code: 'FJ_PSSS_Syndromic_Surveillance_National_Data_Facility_Public',
    projectCodes: '{psss}',
  });
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
