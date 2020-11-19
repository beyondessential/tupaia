'use strict';

import { getDashboardReportById, updateBuilderConfigByReportId } from '../utilities/migration';

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

const dashboardReportIds = [
  'UNFPA_Priority_Medicines_SOH_Project',
  'UNFPA_Priority_Medicines_AMC_Project',
  'UNFPA_Priority_Medicines_MOS_Project',
  'UNFPA_Priority_Medicines_SOH',
  'UNFPA_Priority_Medicines_AMC',
  'UNFPA_Priority_Medicines_MOS',
];

const newOrder = [
  'Contraceptives',
  'Maternal Health Products (UNFPA)',
  'Priority Medicines for Women',
  'Priority Medicines for Children Under 5 Years of Age',
  'Priority Medicines for Child Health and Survival',
  'Child and Maternal Health',
  'Emergency Kits',
];

const previousOrder = [
  'Priority Medicines for Women',
  'Priority Medicines for Children Under 5 Years of Age',
  'Priority Medicines for Child Health and Survival',
  'Child and Maternal Health',
  'Maternal Health Products (UNFPA)',
  'Contraceptives',
  'Emergency Kits',
];

async function reorderRows(db, order) {
  for (const id of dashboardReportIds) {
    const dashboardReport = await getDashboardReportById(db, id);
    const newOrderRows = [];
    dashboardReport.dataBuilderConfig.rows.forEach(element => {
      const index = order.findIndex(e => element.category === e);
      newOrderRows[index] = element;
    });
    dashboardReport.dataBuilderConfig.rows = newOrderRows;
    await updateBuilderConfigByReportId(db, dashboardReport.dataBuilderConfig, id);
  }
}
exports.up = async function (db) {
  await reorderRows(db, newOrder);
};

exports.down = async function (db) {
  await reorderRows(db, previousOrder);
};

exports._meta = {
  version: 1,
};
