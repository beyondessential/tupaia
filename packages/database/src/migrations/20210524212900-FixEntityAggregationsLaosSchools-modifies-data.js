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

const ENTITY_AGGREGATIONS_BY_REPORT_ID = {
  Laos_Schools_Male_Female: {
    dataSourceEntityType: 'school',
    aggregationEntityType: 'country',
    aggregationType: 'SUM_PER_ORG_GROUP',
    aggregationOrder: 'BEFORE',
  },
};

const updateAggregationsForReport = async (db, reportId, entityAggregation) => {
  const dashboardReport = await getDashboardReportById(db, reportId);
  const newJson = dashboardReport.dataBuilderConfig;
  newJson.entityAggregation = entityAggregation;
  await updateBuilderConfigByReportId(db, newJson, reportId);
};

exports.up = async function (db) {
  for (const [reportId, entityAggregation] of Object.entries(ENTITY_AGGREGATIONS_BY_REPORT_ID)) {
    await updateAggregationsForReport(db, reportId, entityAggregation);
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
