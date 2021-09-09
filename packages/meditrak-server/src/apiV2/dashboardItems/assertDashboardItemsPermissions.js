/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { TYPES } from '@tupaia/database';
import {
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
  createDashboardRelationsDBFilter,
} from '../dashboardRelations';
import { hasBESAdminAccess } from '../../permissions';
import { mergeFilter } from '../utilities';

export const hasDashboardItemGetPermissions = async (accessPolicy, models, dashboardItemId) => {
  const dashboards = await models.dashboard.findDashboardsWithRelationsByItemId(dashboardItemId);

  // To view a dashboard item, the user has to have access to the relation between the
  // dashboard item and ANY of the dashboards it is in
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

  return false;
};

export const hasDashboardItemEditPermissions = async (accessPolicy, models, dashboardItemId) => {
  const dashboards = await models.dashboard.findDashboardsWithRelationsByItemId(dashboardItemId);

  // To edit a dashboard item, the user has to have access to the relation between the
  // dashboard item and ALL of the dashboards it is in
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
  const permittedDashboardItems = await models.dashboardItem.find(permittedRelationConditions, {
    joinWith: TYPES.DASHBOARD_RELATION,
    joinCondition: ['dashboard_relation.child_id', 'dashboard_item.id'],
  });
  const permittedDashboardItemIds = permittedDashboardItems.map(d => d.id);

  dbConditions['dashboard_item.id'] = mergeFilter(
    permittedDashboardItemIds,
    dbConditions['dashboard_item.id'],
  );

  return dbConditions;
};
