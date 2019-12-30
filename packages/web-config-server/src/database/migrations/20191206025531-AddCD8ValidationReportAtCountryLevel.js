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

const updateFacilityVR = async (db, countryCode) =>
  db.runSql(
    `UPDATE
    "dashboardGroup"
  SET
    code = '${countryCode}_Communicable_Diseases_Facility_Validation'
  WHERE
    code = '${countryCode}_Communicable_Diseases_Validation';`,
  );

const revertFacilityVR = async (db, countryCode) =>
  db.runSql(
    `UPDATE
    "dashboardGroup"
  SET
    code = '${countryCode}_Communicable_Diseases_Validation'
  WHERE
    code = '${countryCode}_Communicable_Diseases_Facility_Validation';`,
  );

const insertCountryVR = async (db, countryCode) =>
  insertObject(db, 'dashboardGroup', {
    organisationLevel: 'Country',
    userGroup: 'Tonga Communicable Diseases',
    organisationUnitCode: countryCode,
    dashboardReports: `{TO_CD_Validation_CD8}`,
    name: 'Communicable Diseases Validation',
    code: `${countryCode}_Communicable_Diseases_Country_Validation`,
  });

const revertCountryVR = async (db, countryCode) =>
  db.runSql(
    `DELETE FROM "dashboardGroup" WHERE code = '${countryCode}_Communicable_Diseases_Country_Validation';`,
  );

exports.up = async function(db) {
  await updateFacilityVR(db, 'TO');
  await updateFacilityVR(db, 'DL');
  await insertCountryVR(db, 'TO');
  return insertCountryVR(db, 'DL');
};

exports.down = async function(db) {
  await revertFacilityVR(db, 'TO');
  await revertFacilityVR(db, 'DL');
  await revertCountryVR(db, 'TO');
  return revertCountryVR(db, 'DL');
};

exports._meta = {
  version: 1,
};
