/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { RECORDS } from '@tupaia/database';
import {
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
  createDashboardRelationsDBFilter,
} from '../dashboardRelations';
import { hasBESAdminAccess } from '../../permissions';

import { mergeFilter } from '../utilities';

export const hasDashboardItemGetPermissions = async (accessPolicy, models, dashboardItemId) => {
  const dashboards = await models.dashboard.findDashboardsWithRelationsByItemId(dashboardItemId);

  // To view a dashboard item,
  // - the dashboard_item has no relations
  // - OR the user has to have access to ANY of its relations
  if (dashboards.length === 0) {
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

  // To edit a dashboard item,
  // - the dashboard_item has no relations
  // - OR the user has to have access to ALL of its relations
  if (dashboards.length === 0) {
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

  const dashboardItemsWithNoRelationsIds = await models.database.executeSql(`
    SELECT dashboard_item.id FROM dashboard_item
    LEFT JOIN dashboard_relation ON dashboard_item.id = dashboard_relation.child_id
    WHERE dashboard_relation.id IS NULL
  `);

  dbConditions['dashboard_item.id'] = mergeFilter(
    [...permittedDashboardItemsFromRelationsIds, ...dashboardItemsWithNoRelationsIds],
    dbConditions['dashboard_item.id'],
  );

  return dbConditions;
};
