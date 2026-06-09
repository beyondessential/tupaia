'use strict';

import { updateValues } from '../utilities';

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

const DISTRICT_DASHBOARD_IDS = [
  'NR_Covid_Nauru_District_COVID-19_Num_Of_1st_Vaccine_Dose_Taken',
  'NR_Covid_Nauru_District_COVID-19_Num_Of_2nd_Vaccine_Dose_Taken',
];

const COUNTRY_DASHBOARD_IDS = [
  'NR_Covid_Nauru_Country_COVID-19_Num_Of_1st_Vaccine_Dose_Taken',
  'NR_Covid_Nauru_Country_COVID-19_Num_Of_2nd_Vaccine_Dose_Taken',
];

const getDashboardReportById = async (db, id) => {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
};

const updateBuilderConfigByReportId = async (db, newConfig, reportId) => {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
};

exports.up = async function (db) {
  for (const dashboardId of DISTRICT_DASHBOARD_IDS) {
    const dashboardReport = await getDashboardReportById(db, dashboardId);
    dashboardReport.dataBuilderConfig.entityAggregation.dataSourceEntityType = 'sub_district';
    dashboardReport.dataBuilderConfig.entityAggregation.aggregationEntityType = 'district';
    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardId);
  }

  for (const dashboardId of COUNTRY_DASHBOARD_IDS) {
    const dashboardReport = await getDashboardReportById(db, dashboardId);
    dashboardReport.dataBuilderConfig.entityAggregation.dataSourceEntityType = 'sub_district';
    dashboardReport.dataBuilderConfig.entityAggregation.aggregationEntityType = 'country';
    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, dashboardId);
  }
};

exports.down = async function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
