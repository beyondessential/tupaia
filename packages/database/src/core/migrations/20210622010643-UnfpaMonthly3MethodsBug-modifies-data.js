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

const newChartConfig = {
  'Solomon Islands': {
    color: '#f4ea36',
    legendOrder: 7,
  },
  Vanuatu: {
    color: '#2196f3',
    legendOrder: 8,
  },
};

const dashboardIds = [
  'UNFPA_Monthly_3_Methods_of_Contraception_Regional',
  'UNFPA_Monthly_5_Methods_of_Contraception_Regional',
  'UNFPA_Region_Percentage_Facilities_Offering_Services_Family_Planning',
  'UNFPA_Region_Percentage_Facilities_Offering_Services_ANC',
  'UNFPA_Region_Percentage_Facilities_Offering_Services_PNC',
  'UNFPA_Region_Percentage_Facilities_Offering_Services_Delivery',
];

exports.up = async function (db) {
  for (const dashboardId of dashboardIds) {
    const report = await getDashboardReportById(db, dashboardId);
    const { viewJson } = report;
    viewJson.chartConfig = { ...viewJson.chartConfig, ...newChartConfig };
    await updateValues(db, 'dashboardReport', { viewJson }, { id: dashboardId });
  }
};

exports.down = function (db) {};

exports._meta = {
  version: 1,
};
