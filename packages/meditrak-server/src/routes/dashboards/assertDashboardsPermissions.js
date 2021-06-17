/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { flatten } from 'lodash';
import { hasBESAdminAccess } from '../../permissions';
import {
  createDashboardItemsDBFilter,
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
} from '../dashboardItems';
import { mergeFilter } from '../utilities';

export const assertDashboardGetPermissions = async (accessPolicy, models, dashboardId) => {
  const dashboard = await models.dashboard.findById(dashboardId);
  const dashboardRelations = await models.dashboardRelation.find({ dashboard_id: dashboardId });

  // If the user has GET permission to ANY of the dashboard items in the dashboard,
  // then user has access to view that dashboard
  for (const dashboardRelation of dashboardRelations) {
    if (
      await hasDashboardRelationGetPermissions(
        accessPolicy,
        models,
        dashboardRelation.permission_groups,
        dashboard.root_entity_code,
      )
    ) {
      return true;
    }
  }

  throw new Error('Requires access to one of the dashboard items in the dashboard');
};

export const assertDashboardEditPermissions = async (accessPolicy, models, dashboardId) => {
  const dashboard = await models.dashboard.findById(dashboardId);
  const dashboardRelations = await models.dashboardRelation.find({ dashboard_id: dashboardId });

  // If the user has EDIT permission to ALL of the dashboard items in the dashboard,
  // then user has access to edit that dashboard
  for (const dashboardRelation of dashboardRelations) {
    if (
      !(await hasDashboardRelationEditPermissions(
        accessPolicy,
        models,
        dashboardRelation.permission_groups,
        dashboard.root_entity_code,
      ))
    ) {
      throw new Error(
        `Requires access to all of the dashboard items in this dashboard and Tupaia Admin Access to ${dashboard.root_entity_code}`,
      );
    }
  }

  return true;
};

export const createDashboardsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard items we have access to, then pull the dashboards
  // we have permission to from that
  const dashboardItemsConditions = createDashboardItemsDBFilter(accessPolicy);
  const permittedDashboardItems = await models.dashboardItem.find(dashboardItemsConditions);
  const permittedDashboardsByItemIds = await models.dashboard.findDashboardsByItemIds(
    permittedDashboardItems.map(di => di.id),
  );
  const permittedDashboards = flatten(Object.values(permittedDashboardsByItemIds));
  const permittedDashboardIds = [...new Set(permittedDashboards.map(d => d.id))];

  dbConditions['dashboard.id'] = mergeFilter(permittedDashboardIds, dbConditions['dashboard.id']);

  return dbConditions;
};
