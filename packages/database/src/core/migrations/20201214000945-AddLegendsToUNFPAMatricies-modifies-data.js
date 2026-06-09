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

const getDashboardReportById = async (db, id) => {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
};

const updateViewJsonByReportId = async (db, newJson, reportId) => {
  return updateValues(db, 'dashboardReport', { viewJson: newJson }, { id: reportId });
};

const REPORT_IDS = ['UNFPA_Priority_Medicines_MOS', 'UNFPA_Priority_Medicines_MOS_Project'];

const ORDERED_CONDITION_LEGEND_LABELS = {
  red: 'Stock out (MOS 0)',
  orange: 'Below minimum (MOS 1-2)',
  green: 'Stocked appropriately (MOS 3-6)',
  yellow: 'Overstock (MOS-6)',
};

exports.up = async function (db) {
  for (const reportId of REPORT_IDS) {
    const dashboardReport = await getDashboardReportById(db, reportId);

    const { viewJson } = dashboardReport;

    // 1. add legend labels
    for (const condition of viewJson.presentationOptions.conditions) {
      condition.legendLabel = ORDERED_CONDITION_LEGEND_LABELS[condition.key];
    }

    // 2. reorder
    const newOrder = [];
    for (const key of Object.keys(ORDERED_CONDITION_LEGEND_LABELS)) {
      newOrder.push(
        viewJson.presentationOptions.conditions.find(condition => condition.key === key),
      );
    }
    viewJson.presentationOptions.conditions = newOrder;

    await updateViewJsonByReportId(db, viewJson, reportId);
  }

  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
