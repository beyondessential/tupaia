'use strict';

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

// Get the dashboard items with displayOnEntityConditions set in the config
const getPieChartDashboardItemsWithPresentationOptions = async db => {
  const dashboardItems = await db.runSql(`
    SELECT * from dashboard_item 
    WHERE config->>'chartType' = 'pie' AND config->>'presentationOptions' IS NOT NULL;
  `);
  return dashboardItems.rows;
};

// update the dashboard item to remove displayOnEntityConditions from the config and update the dashboard relations
const updateDashboardItem = async (db, dashboardItem) => {
  const { config } = dashboardItem;
  const { presentationOptions } = config;
  const { exportWithLabels, exportWithTable, exportWithTableDisabled, ...segmentConfig } =
    presentationOptions;
  if (
    exportWithLabels === undefined &&
    exportWithTable === undefined &&
    exportWithTableDisabled === undefined
  ) {
    delete config.presentationOptions;
  } else {
    config.presentationOptions = { exportWithLabels, exportWithTable, exportWithTableDisabled };
  }

  if (Object.keys(segmentConfig).length > 0) {
    config.segmentConfig = segmentConfig;
  }

  await db.runSql(`
    UPDATE dashboard_item
    SET config = '${JSON.stringify(config).replace(/'/g, "''")}'
    WHERE id = '${dashboardItem.id}';
  `);
};

exports.up = async function (db) {
  const dashboardItems = await getPieChartDashboardItemsWithPresentationOptions(db);
  await Promise.all(dashboardItems.map(dashboardItem => updateDashboardItem(db, dashboardItem)));
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
