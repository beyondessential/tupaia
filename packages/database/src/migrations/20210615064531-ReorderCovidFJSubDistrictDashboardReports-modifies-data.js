'use strict';

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
  return db.runSql(`
    UPDATE "dashboardGroup"
    SET "dashboardReports" = '{FJ_Covid_Fiji_SubDistrict_COVID-19_Num_Of_1st_Vaccine_Dose_Taken,FJ_Covid_Fiji_SubDistrict_COVID-19_Num_Of_2nd_Vaccine_Dose_Taken,FJ_Total_Number_Of_People_1st_Dose_Covid_Vaccine,FJ_Total_Number_Of_People_2nd_Dose_Covid_Vaccine,FJ_Covid_Fiji_COVID-19_Percent_Of_Population_1st_Vaccine_Dose_Taken,FJ_Covid_Fiji_COVID-19_Percent_Of_Population_2nd_Vaccine_Dose_Taken}'
    WHERE code = 'FJ_Covid_Fiji_SubDistrict_COVID-19'
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
