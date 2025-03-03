import { RECORDS } from '@tupaia/database';
import {
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
  createDashboardRelationsDBFilter,
} from '../dashboardRelations';
import { hasBESAdminAccess, hasSomePermissionGroupsAccess } from '../../permissions';

import { mergeFilter } from '../utilities';

export const hasDashboardItemGetPermissions = async (accessPolicy, models, dashboardItemId) => {
  const dashboards = await models.dashboard.findDashboardsWithRelationsByItemId(dashboardItemId);
  const permittedDashboardItems = await getPermittedDashboardItems(accessPolicy, models);

  // To view a dashboard item, the user has to have access to the relation between the
  // dashboard item and ANY of the dashboards it is in
  // OR user's access policy covers the dashboard item's permission_group_ids column

  if (permittedDashboardItems.includes(dashboardItemId)) {
    return true;
  }

  for (const dashboard of dashboards) {
    if (
      await hasDashboardRelationGetPermissions(
        accessPolicy,
        models,
        dashboard.permissionGroups,
        dashboard.rootEntityCode,
      )
    ) {
      return true;
    }
  }

  // or has edit permissions to it

  return false;
};

export const hasDashboardItemEditPermissions = async (accessPolicy, models, dashboardItemId) => {
  const dashboards = await models.dashboard.findDashboardsWithRelationsByItemId(dashboardItemId);
  const permittedDashboardItems = await getPermittedDashboardItems(accessPolicy, models);

  // To edit a dashboard item, the user has to have access to the relation between the
  // dashboard item and ALL of the dashboards it is in
  // OR user's access policy covers the dashboard item's permission_group_ids column

  if (permittedDashboardItems.includes(dashboardItemId)) {
    return true;
  }

  for (const dashboard of dashboards) {
    if (
      !(await hasDashboardRelationEditPermissions(
        accessPolicy,
        models,
        dashboard.permissionGroups,
        dashboard.rootEntityCode,
      ))
    ) {
      return false;
    }
  }

  return true;
};

export const assertDashboardItemGetPermissions = async (accessPolicy, models, dashboardItemId) => {
  if (await hasDashboardItemGetPermissions(accessPolicy, models, dashboardItemId)) {
    return true;
  }

  throw new Error(
    'Requires access to the dashboard item in one of the dashboards this dashboard item is in',
  );
};

export const assertDashboardItemEditPermissions = async (accessPolicy, models, dashboardItemId) => {
  if (await hasDashboardItemEditPermissions(accessPolicy, models, dashboardItemId)) {
    return true;
  }

  throw new Error(
    `Requires access to the dashboard item in all of the dashboards this dashboard item is in, and Tupaia Admin Panel access to the connected dashboard's root_entity_code`,
  );
};

export const createDashboardItemsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard relations we have access to,
  // then pull the corresponding dashboard items
  const permittedRelationConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  const permittedDashboardItemsFromRelations = await models.dashboardItem.find(
    permittedRelationConditions,
    {
      joinWith: RECORDS.DASHBOARD_RELATION,
      joinCondition: ['dashboard_relation.child_id', 'dashboard_item.id'],
    },
  );
  const permittedDashboardItemsFromRelationsIds = permittedDashboardItemsFromRelations.map(
    d => d.id,
  );

  const permittedDashboardItems = await getPermittedDashboardItems(accessPolicy, models);

  dbConditions['dashboard_item.id'] = mergeFilter(
    [...permittedDashboardItemsFromRelationsIds, ...permittedDashboardItems],
    dbConditions['dashboard_item.id'],
  );

  return dbConditions;
};

const getPermittedDashboardItems = async (accessPolicy, models) => {
  const allDashboardItems = await models.dashboardItem.all();
  const allPermissionGroups = await models.permissionGroup.all();
  const permissionGroupIdToName = {};
  allPermissionGroups.forEach(permissionGroup => {
    permissionGroupIdToName[permissionGroup.id] = permissionGroup.name;
  });

  const permittedItems = allDashboardItems
    .filter(item => {
      if (!item.permission_group_ids) {
        return false;
      }
      const permissionGroupNames = item.permission_group_ids.map(
        permissionGroupId => permissionGroupIdToName[permissionGroupId],
      );

      const hasPermission = hasSomePermissionGroupsAccess(accessPolicy, permissionGroupNames);
      return !!hasPermission;
    })
    .map(item => item.id);

  return permittedItems;
};
