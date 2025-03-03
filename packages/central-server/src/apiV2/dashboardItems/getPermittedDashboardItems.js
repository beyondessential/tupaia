import { hasSomePermissionGroupsAccess } from '../../permissions';

export const getPermittedDashboardItems = async (accessPolicy, models) => {
  const allDashboardItems = await models.dashboardItem.all();
  const allPermissionGroups = await models.permissionGroup.all();
  const permissionGroupIdToName = {};
  allPermissionGroups.forEach(permissionGroup => {
    permissionGroupIdToName[permissionGroup.id] = permissionGroup.name;
  });

  return allDashboardItems
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
};
