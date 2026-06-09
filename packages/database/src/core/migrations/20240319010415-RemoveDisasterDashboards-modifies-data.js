'use strict';

var dbm;
var type;
var seed;

const DISASTER_DASHBOARD_CODES = [
  'TO_Disaster_Response',
  'DL_Disaster_Response',
  'VU_Disaster_Response',
  'disaster_Disaster_Response',
];

const convertArrayToString = array => {
  return array.map(item => `'${item}'`).join(',');
};

// remove the disaster project code from dashboard relations with multiple project codes including disaster
const removeDisasterFromSharedDashboard = async db => {
  const { rows: disasterDashboardRelationsWithMultipleProjectCodes } = await db.runSql(`
    SELECT *
    FROM dashboard_relation
    WHERE project_codes @> ARRAY['disaster'] AND array_length(project_codes, 1) > 1;
    `);
  if (disasterDashboardRelationsWithMultipleProjectCodes.length === 0) return;
  await Promise.all(
    disasterDashboardRelationsWithMultipleProjectCodes.map(async relation => {
      const updatedProjectCodes = relation.project_codes.filter(code => code !== 'disaster');
      await db.runSql(`
        UPDATE dashboard_relation
        SET project_codes = '{${updatedProjectCodes.join(',')}}'
        WHERE id = '${relation.id}';
      `);
    }),
  );
};

// Get all dashboards that are related to disasters
const getDashboards = async db => {
  const { rows: dashboards } = await db.runSql(`
    SELECT * from dashboard
    where code IN (${convertArrayToString(DISASTER_DASHBOARD_CODES)});
  `);
  return dashboards;
};

// Get all dashboard relations that are related to disasters
const getDashboardRelations = async (db, dashboardIds) => {
  const { rows: dashboardRelations } = await db.runSql(`
    SELECT * from dashboard_relation
    where dashboard_id IN (${convertArrayToString(dashboardIds)});
  `);
  return dashboardRelations;
};

// Remove dashboard relations that are related to disasters
const removeDashboardRelations = async (db, dashboardIds) => {
  if (dashboardIds.length === 0) return;
  await db.runSql(`
    DELETE from dashboard_relation
    where dashboard_id IN (${convertArrayToString(dashboardIds)});
  `);
};

// Remove dashboards that are related to disasters
const removeDashboards = async (db, dashboardIds) => {
  if (dashboardIds.length === 0) return;
  await db.runSql(`
    DELETE from dashboard
    where id IN (${convertArrayToString(dashboardIds)});
  `);
};

// Remove dashboard items that are related to disasters and don't have any other dashboard relations outside of the disaster dashboards
const removeDisasterDashboardItems = async (db, dashboardIds, dashboardItemIds) => {
  if (dashboardIds.length === 0 || dashboardItemIds.length === 0) return;
  // get a list of dashboard items that don't have a dashboard relation outside of the disaster dashboards
  const { rows: dashboardItemsWithOtherRelations } = await db.runSql(`
    SELECT DISTINCT child_id from dashboard_relation 
      where child_id IN (${convertArrayToString(dashboardItemIds)}) 
      AND dashboard_id NOT IN (${convertArrayToString(dashboardIds)});
    `);

  const dashboardItemsToRemove = dashboardItemIds.filter(
    id => !dashboardItemsWithOtherRelations.map(item => item.child_id).includes(id),
  );

  if (dashboardItemsToRemove.length === 0) return;

  await db.runSql(`
    DELETE from dashboard_item
    where id IN (${convertArrayToString(dashboardItemsToRemove)});
  `);
};

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await removeDisasterFromSharedDashboard(db);
  const dashboards = await getDashboards(db);
  if (dashboards.length === 0) return;
  const dashboardIds = dashboards.map(dashboard => dashboard.id);
  const dashboardRelations = await getDashboardRelations(db, dashboardIds);
  const dashboardItemIds = dashboardRelations.map(relation => relation.child_id);
  await removeDashboardRelations(db, dashboardIds);
  await removeDisasterDashboardItems(db, dashboardIds, dashboardItemIds);
  await removeDashboards(db, dashboardIds);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
