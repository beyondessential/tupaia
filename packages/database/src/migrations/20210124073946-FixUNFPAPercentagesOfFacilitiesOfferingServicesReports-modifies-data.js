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

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}

const dashboardReportsConfig = {
  ids: [
    'UNFPA_Region_Percentage_Facilities_Offering_Services_ANC',
    'UNFPA_Region_Percentage_Facilities_Offering_Services_Delivery',
    'UNFPA_Region_Percentage_Facilities_Offering_Services_Family_Planning',
    'UNFPA_Region_Percentage_Facilities_Offering_Services_PNC',
  ],
  oldDataBuilder: 'sumValuesPerQuarterByOrgUnit',
  newDataBuilder: 'finalValuesPerQuarterByOrgUnit',
};

exports.up = async function (db) {
  for (const id of dashboardReportsConfig.ids) {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    dataBuilderConfig.dataBuilders.countFacilitiesSurveyed.dataBuilder =
      dashboardReportsConfig.newDataBuilder;
    dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilder =
      dashboardReportsConfig.newDataBuilder;
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  }
};

exports.down = async function (db) {
  for (const id of dashboardReportsConfig.ids) {
    const dashboardReport = await getDashboardReportById(db, id);
    const { dataBuilderConfig } = dashboardReport;
    dataBuilderConfig.dataBuilders.countFacilitiesSurveyed.dataBuilder =
      dashboardReportsConfig.oldDataBuilder;
    dataBuilderConfig.dataBuilders.sumFacilitiesWithServicesAvailable.dataBuilder =
      dashboardReportsConfig.oldDataBuilder;
    await updateBuilderConfigByReportId(db, dataBuilderConfig, id);
  }
};

exports._meta = {
  version: 1,
};
