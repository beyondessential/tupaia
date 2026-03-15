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
const dashboardGroup =
  // Covid Fiji
  {
    organisationLevel: 'SubDistrict',
    userGroup: 'COVID-19',
    organisationUnitCode: 'FJ',
    dashboardReports:
      '{FJ_Covid_Fiji_District_COVID-19_Num_Of_1st_Vaccine_Dose_Taken,FJ_Covid_Fiji_District_COVID-19_Num_Of_2nd_Vaccine_Dose_Taken,FJ_Total_Number_Of_People_1st_Dose_Covid_Vaccine,FJ_Total_Number_Of_People_2nd_Dose_Covid_Vaccine}',
    name: 'COVID-19 Fiji',
    code: 'FJ_Covid_Fiji_SubDistrict_COVID-19',
    projectCodes: `{supplychain_fiji}`,
  };

exports.up = function (db) {
  return insertObject(db, 'dashboardGroup', dashboardGroup);
};

exports.down = function (db) {
  return db.runSql(`
    delete from "dashboardGroup" where code = '${dashboardGroup.code}';
  `);
};

exports._meta = {
  version: 1,
};
