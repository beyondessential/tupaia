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

// Update data builder configuration for a report
async function updateBuilderConfigByReportId(db, newConfig, reportId) {
  return updateValues(db, 'dashboardReport', { dataBuilderConfig: newConfig }, { id: reportId });
}

const REPORT_ID = 'Laos_Schools_Male_Female';

exports.up = async function (db) {
  const dashboardReport = await getDashboardReportById(db, REPORT_ID);
  const newJson = dashboardReport.dataBuilderConfig;
  newJson.entityAggregation = {
    dataSourceEntityType: 'school',
    aggregationEntityType: 'country',
    aggregationType: 'MOST_RECENT_PER_ORG_GROUP',
  };
  newJson.aggregations = [
    {
      aggregationType: 'SUM_PER_ORG_GROUP',
    },
  ];
  await updateBuilderConfigByReportId(db, newJson, REPORT_ID);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
