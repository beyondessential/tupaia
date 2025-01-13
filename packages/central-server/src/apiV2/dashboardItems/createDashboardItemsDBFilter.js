import { RECORDS } from '@tupaia/database';
import { hasBESAdminAccess, hasSomePermissionGroupsAccess } from '../../permissions';
import { createDashboardRelationsDBFilter } from '../dashboardRelations';
import { mergeFilter } from '../utilities';

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
