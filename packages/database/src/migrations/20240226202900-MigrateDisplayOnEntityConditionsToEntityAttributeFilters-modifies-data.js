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
const getDashboardItemsWithDisplayOnEntityConditions = async db => {
  const dashboardItems = await db.runSql(`
    SELECT * from dashboard_item 
    WHERE config->>'displayOnEntityConditions' IS NOT NULL;
  `);
  return dashboardItems.rows;
};

// get the dashboard relations for a dashboard item
const getDashboardRelations = async (db, dashboardItemId) => {
  const dashboardRelations = await db.runSql(`
    SELECT * from dashboard_relation 
    WHERE child_id = '${dashboardItemId}';
  `);
  return dashboardRelations.rows;
};

// update the dashboard relation to have attributes filters made from displayOnEntityConditions
const updateDashboardRelation = async (db, dashboardRelation, displayOnEntityConditions) => {
  const { attributes } = displayOnEntityConditions;
  await db.runSql(`
    UPDATE dashboard_relation
    SET attributes_filter = '${JSON.stringify(attributes)}'
    WHERE id = '${dashboardRelation.id}';
  `);
};

// update the dashboard item to remove displayOnEntityConditions from the config and update the dashboard relations
const updateDashboardItem = async (db, dashboardItem) => {
  const { config } = dashboardItem;
  const newConfig = { ...config };
  delete newConfig.displayOnEntityConditions;

  const dashboardRelations = await getDashboardRelations(db, dashboardItem.id);

  await Promise.all(
    dashboardRelations.map(dashboardRelation =>
      updateDashboardRelation(db, dashboardRelation, config.displayOnEntityConditions),
    ),
  );

  await db.runSql(`
    UPDATE dashboard_item
    SET config = '${JSON.stringify(newConfig)}'
    WHERE id = '${dashboardItem.id}';
  `);
};

exports.up = async function (db) {
  const dashboardItems = await getDashboardItemsWithDisplayOnEntityConditions(db);
  await Promise.all(dashboardItems.map(dashboardItem => updateDashboardItem(db, dashboardItem)));
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
