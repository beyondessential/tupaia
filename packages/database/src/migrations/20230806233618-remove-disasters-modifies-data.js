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

export const arrayToDbString = array => array.map(item => `'${item}'`).join(', ');

const DISASTER_PROJECT_CODE = 'disaster';

exports.up = async function (db) {
  await db.runSql('START TRANSACTION');
  // Access Requests
  await db.runSql(
    `DELETE FROM access_request WHERE project_id = (SELECT id FROM project WHERE code = '${DISASTER_PROJECT_CODE}')`,
  );

  // Dashboards
  const dashboardIdsResult = await db.runSql(
    `SELECT DISTINCT dashboard_id FROM dashboard_relation, unnest(project_codes) as pc GROUP BY dashboard_id HAVING '${DISASTER_PROJECT_CODE}' =ALL(array_agg(pc))`,
  );
  const dashboardIds = arrayToDbString(dashboardIdsResult.rows.map(row => row.dashboard_id));
  const childIdsResult = await db.runSql(
    `SELECT DISTINCT child_id FROM dashboard_relation WHERE '${DISASTER_PROJECT_CODE}' =ALL(project_codes)`,
  );
  const childIds = arrayToDbString(childIdsResult.rows.map(row => row.child_id));
  await db.runSql(
    `DELETE FROM dashboard_relation WHERE '${DISASTER_PROJECT_CODE}' =ALL(project_codes)`,
  );
  await db.runSql(
    `UPDATE dashboard_relation SET project_codes = array_remove(project_codes, '${DISASTER_PROJECT_CODE}') WHERE '${DISASTER_PROJECT_CODE}' =ANY(project_codes)`,
  );
  await db.runSql(`DELETE FROM dashboard WHERE id IN (${dashboardIds})`);
  await db.runSql(`DELETE FROM dashboard_item WHERE id IN (${childIds})`);

  // Map Overlays
  const DISASTER_MAP_OVERLAY_GROUP_CODE = 'Disaster_response';
  await db.runSql(
    `DELETE FROM map_overlay_group_relation WHERE map_overlay_group_id = (SELECT id FROM map_overlay_group WHERE code = '${DISASTER_MAP_OVERLAY_GROUP_CODE}')`,
  );
  await db.runSql(
    `DELETE FROM map_overlay_group WHERE code = '${DISASTER_MAP_OVERLAY_GROUP_CODE}'`,
  );
  await db.runSql(`DELETE FROM map_overlay WHERE '${DISASTER_PROJECT_CODE}' =ALL(project_codes)`);

  // Entities
  await db.runSql(
    `DELETE FROM entity_relation WHERE entity_hierarchy_id = (SELECT entity_hierarchy_id FROM project WHERE code = '${DISASTER_PROJECT_CODE}')`,
  );
  await db.runSql(`DELETE FROM entity WHERE type = '${DISASTER_PROJECT_CODE}'`);
  await db.runSql(`DELETE FROM entity WHERE code = '${DISASTER_PROJECT_CODE}'`);

  // Permissions
  const DISASTER_PROJECT_PERMISSION_GROUP_NAME = 'Disaster Response';
  const DISASTER_PROJECT_ADMIN_PERMISSION_GROUP_NAME = 'Disaster Response Admin';
  await db.runSql(
    `DELETE FROM user_entity_permission WHERE permission_group_id = (SELECT id FROM permission_group WHERE name = '${DISASTER_PROJECT_ADMIN_PERMISSION_GROUP_NAME}')`,
  );
  await db.runSql(
    `DELETE FROM user_entity_permission WHERE permission_group_id = (SELECT id FROM permission_group WHERE name = '${DISASTER_PROJECT_PERMISSION_GROUP_NAME}')`,
  );

  // Project
  await db.runSql(`DELETE FROM project WHERE code = '${DISASTER_PROJECT_CODE}'`);
  await db.runSql(
    `DELETE FROM permission_group WHERE name = '${DISASTER_PROJECT_PERMISSION_GROUP_NAME}'`,
  );
  await db.runSql(
    `DELETE FROM permission_group WHERE name = '${DISASTER_PROJECT_ADMIN_PERMISSION_GROUP_NAME}'`,
  );

  await db.runSql('COMMIT');
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
