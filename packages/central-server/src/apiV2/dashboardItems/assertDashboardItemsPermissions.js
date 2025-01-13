/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import {
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
} from '../dashboardRelations';
import { hasVizBuilderAccessToEntityCode } from '../utilities';

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

  const permissionChecks = await Promise.all(
    dashboards.map(dashboard =>
      hasDashboardRelationEditPermissions(
        accessPolicy,
        models,
        dashboard.permissionGroups,
        dashboard.rootEntityCode,
      ),
    ),
  );

  const vizBuilderUserPermissionChecks = await Promise.all(
    dashboards.map(dashboard =>
      hasVizBuilderAccessToEntityCode(accessPolicy, models, dashboard.rootEntityCode),
    ),
  );

  return (
    permissionChecks.every(result => result) &&
    vizBuilderUserPermissionChecks.every(result => result)
  );
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
  if (!(await hasDashboardItemEditPermissions(accessPolicy, models, dashboardItemId))) {
    throw new Error(
      `Access to the dashboard item in all of the dashboards this dashboard item is in is required`,
    );
  }

  return true;
};
