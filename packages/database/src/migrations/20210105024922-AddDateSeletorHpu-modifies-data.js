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

const dashboardId = 'TO_HPU_Total_Screened_For_NCD_Risk_Factors_By_Age_And_Gender';
const periodGranularity = 'one_year_at_a_time';

async function updateViewJsonByReportId(db, newJson, reportId) {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
}

exports.up = async function (db) {
  const report = await getDashboardReportById(db, dashboardId);
  const { viewJson } = report;

  await updateViewJsonByReportId(db, { ...viewJson, periodGranularity }, dashboardId);
};

exports.down = async function (db) {
  const report = await getDashboardReportById(db, dashboardId);
  const { viewJson } = report;

  delete viewJson.periodGranularity;
  await updateViewJsonByReportId(db, viewJson, dashboardId);
};

exports._meta = {
  version: 1,
};
