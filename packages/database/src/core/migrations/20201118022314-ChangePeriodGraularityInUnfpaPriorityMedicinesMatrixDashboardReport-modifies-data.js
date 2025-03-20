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

const dashboardReportsId = [
  'UNFPA_Priority_Medicines_MOS',
  'UNFPA_Priority_Medicines_AMC',
  'UNFPA_Priority_Medicines_SOH',
  'UNFPA_Priority_Medicines_AMC_Project',
  'UNFPA_Priority_Medicines_MOS_Project',
  'UNFPA_Priority_Medicines_SOH_Project',
];

const periodGranularity = 'one_month_at_a_time';
const defaultTimePeriod = {
  unit: 'month',
  offset: -1,
};

const datePickerLimits = {
  end: {
    unit: 'month',
    offset: -1,
  },
  start: {
    unit: 'month',
    offset: -365,
  },
};

const showPeriodRange = 'all';

async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}

async function updateViewJsonByReportId(db, newJson, reportId) {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
}

exports.up = async function (db) {
  for (const id of dashboardReportsId) {
    const dashboardReport = await getDashboardReportById(db, id);
    const newJson = dashboardReport.viewJson;
    newJson.periodGranularity = periodGranularity;
    newJson.defaultTimePeriod = defaultTimePeriod;
    newJson.datePickerLimits = datePickerLimits;
    newJson.showPeriodRange = showPeriodRange;
    await updateViewJsonByReportId(db, newJson, id);
  }
};

exports.down = async function (db) {
  for (const id of dashboardReportsId) {
    const dashboardReport = await getDashboardReportById(db, id);
    const newJson = dashboardReport.viewJson;
    newJson.periodGranularity = 'month';
    delete newJson.defaultTimePeriod;
    delete newJson.datePickerLimits;
    delete newJson.showPeriodRange;
    await updateViewJsonByReportId(db, newJson, id);
  }
};

exports._meta = {
  version: 1,
};
