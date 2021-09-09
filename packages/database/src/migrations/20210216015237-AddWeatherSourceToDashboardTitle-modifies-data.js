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

async function updateViewJsonByReportId(db, newJson, reportId) {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
}

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

const reference = {
  link: 'https://www.weatherbit.io/',
  name: 'openweather',
};

const dashboards = [
  'LA_EOC_Observed_Daily_Rainfall_And_Temperature',
  'LA_EOC_Forecast_Daily_Rainfall_And_Temperature',
];

exports.up = async function (db) {
  for (const id of dashboards) {
    const report = await getDashboardReportById(db, id);
    await updateViewJsonByReportId(db, { ...report.viewJson, reference }, id);
  }
};

exports.down = async function (db) {
  for (const id of dashboards) {
    const report = await getDashboardReportById(db, id);
    const newJson = { ...report.viewJson };
    delete newJson.reference;
    await updateViewJsonByReportId(db, newJson, id);
  }
};

exports._meta = {
  version: 1,
};
