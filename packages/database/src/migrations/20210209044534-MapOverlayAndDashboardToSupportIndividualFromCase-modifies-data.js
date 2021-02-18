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

const INDIVIDUAL = 'individual';
const CASE = 'case';
const MAP_OVERLAY = 'mapOverlay';
const DASHBOARD_REPORT = 'dashboardReport';
const mapOverlays = ['COVID_WS_Home_Village_Of_Quarantine_Passengers'];
const dashboards = [
  'COVID_Total_Repatriated_Passengers',
  'Samoa_Covid_Age_Demo_Per_Flight',
  'Samoa_Covid_Clearance_Documents_Per_Flight',
  'Samoa_Covid_Demo_Health_Cons_Per_Flight',
  'Samoa_Covid_Demo_Indiv_Sex_Per_Flight',
  'Samoa_Covid_Quarantine_Site_By_Flight',
];
async function getMapOverlayById(db, id) {
  const { rows: mapOverlay } = await db.runSql(`
      SELECT * FROM "${MAP_OVERLAY}"
      WHERE id = '${id}';
  `);
  return mapOverlay[0] || null;
}
async function getDashboardReportById(db, id) {
  const { rows: dashboardReports } = await db.runSql(`
      SELECT * FROM "dashboardReport"
      WHERE id = '${id}';
  `);
  return dashboardReports[0] || null;
}
const changeDataSourceEntityTypeInMapOverlay = async (db, newType) => {
  for (const id of mapOverlays) {
    const mapOverlay = await getMapOverlayById(db, id);
    const newMeasureBuilderConfig = { ...mapOverlay.measureBuilderConfig };
    newMeasureBuilderConfig.entityAggregation.dataSourceEntityType = newType;
    await updateValues(db, MAP_OVERLAY, { measureBuilderConfig: newMeasureBuilderConfig }, { id });
  }
};
const changeDataSourceEntityTypeInDashboard = async (db, newType) => {
  for (const id of dashboards) {
    const dashboard = await getDashboardReportById(db, id);
    const newDataBuilderConfig = { ...dashboard.dataBuilderConfig };
    newDataBuilderConfig.entityAggregation.dataSourceEntityType = newType;
    await updateValues(db, DASHBOARD_REPORT, { dataBuilderConfig: newDataBuilderConfig }, { id });
  }
};

exports.up = async function (db) {
  // Update 'measureBuilderConfig' in map overlays using entityType 'individual'
  await changeDataSourceEntityTypeInMapOverlay(db, INDIVIDUAL);
  // Update 'dataBuilderConfig' in 'dashboardReport' using entityType 'individual'
  await changeDataSourceEntityTypeInDashboard(db, INDIVIDUAL);
};

exports.down = async function (db) {
  // Change back 'measureBuilderConfig' in map overlays from 'individual' entityType to 'case'
  await changeDataSourceEntityTypeInMapOverlay(db, CASE);
  // Update 'dataBuilderConfig' in 'dashboardReport' using entityType 'case'
  await changeDataSourceEntityTypeInDashboard(db, CASE);
};

exports._meta = {
  version: 1,
};
