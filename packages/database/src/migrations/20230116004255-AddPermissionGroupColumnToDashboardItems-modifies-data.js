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

const getPermissionGroupMap = async db => {
  const { rows: dashboardRelations } = await db.runSql(`
    select child_id, permission_groups from dashboard_relation;
  `);

  const dashboardRelationsChildIdToPermissionGroups = {};
  dashboardRelations.forEach(relation => {
    const { child_id: childId, permission_groups: permissionGroups } = relation;
    if (dashboardRelationsChildIdToPermissionGroups[childId]) {
      dashboardRelationsChildIdToPermissionGroups[childId] = [
        ...dashboardRelationsChildIdToPermissionGroups[childId],
        ...permissionGroups,
      ];
    }
    dashboardRelationsChildIdToPermissionGroups[childId] = permissionGroups;
  });

  return dashboardRelationsChildIdToPermissionGroups;
};

const getPermissionGroupNamesToIdMap = async db => {
  const { rows: permissionGroups } = await db.runSql(`
    select id, name from permission_group;
  `);
  const permissionGroupNameToId = {};
  permissionGroups.forEach(permissionGroup => {
    permissionGroupNameToId[permissionGroup.name] = permissionGroup.id;
  });
  return permissionGroupNameToId;
};

exports.up = async function (db) {
  // add new column
  await db.addColumn('dashboard_item', 'permission_group_ids', 'text[]');
  // get relation and permission group data
  const relationChildIdToPermissionGroups = await getPermissionGroupMap(db);
  const permissionGroupNamesToId = await getPermissionGroupNamesToIdMap(db);
  // get dashboard item ids
  const { rows: dashboardItems } = await db.runSql(`
    select id from dashboard_item;
  `);
  // update all dashboard items
  for (const { id: dashboardItemId } of dashboardItems) {
    if (relationChildIdToPermissionGroups[dashboardItemId]) {
      const permissionGroupIds = relationChildIdToPermissionGroups[dashboardItemId]
        .map(permissionGroupName => {
          return permissionGroupNamesToId[permissionGroupName];
        })
        .filter(id => !!id);
      // just in case some permission group names no longer exist and there are empty arrays
      if (permissionGroupIds && permissionGroupIds.length > 0) {
        await updateValues(
          db,
          'dashboard_item',
          { permission_group_ids: permissionGroupIds },
          { id: dashboardItemId },
        );
      }
    }
  }
};

exports.down = async function (db) {
  await db.removeColumn('dashboard_item', 'permission_group_ids');
};

exports._meta = {
  version: 1,
};
