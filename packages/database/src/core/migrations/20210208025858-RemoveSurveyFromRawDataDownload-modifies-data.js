'use strict';

import { updateValues } from '../utilities/migration';

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
const rawDataDownloadDashboardReport = 'Raw_Data_Samoa_Covid_Surveys';
const surveyToBeRemoved = {
  code: 'SC1QMIA',
  name: 'Initial Quarantine Assessment',
};

exports.up = async function (db) {
  const { dataBuilderConfig } = await getDashboardReportById(db, rawDataDownloadDashboardReport);
  const newSurveys = dataBuilderConfig.surveys.filter(
    survey => survey.code !== surveyToBeRemoved.code,
  );
  await updateBuilderConfigByReportId(db, { surveys: newSurveys }, rawDataDownloadDashboardReport);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
