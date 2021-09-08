/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { hasBESAdminAccess } from '../../permissions';
import {
  createDashboardRelationsDBFilter,
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
} from '../dashboardRelations';
import { mergeFilter, hasTupaiaAdminAccessToEntityForVisualisation } from '../utilities';

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

export const assertDashboardCreatePermissions = async (
  accessPolicy,
  models,
  { root_entity_code: rootEntityCode },
) => {
  const entity = await models.entity.findOne({ code: rootEntityCode });

  if (!(await hasTupaiaAdminAccessToEntityForVisualisation(accessPolicy, models, entity))) {
    throw new Error(`Requires Tupaia Admin Panel access to the entity code: '${rootEntityCode}'`);
  }

  return true;
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

  // Pull the list of dashboard relations we have access to,
  // then pull the corresponding dashboards
  const dashboardRelationsFilter = createDashboardRelationsDBFilter(accessPolicy);
  const permittedDashboardRelations = await models.dashboardRelation.find(dashboardRelationsFilter);
  const permittedDashboards = await models.dashboard.find({
    id: permittedDashboardRelations.map(dr => dr.dashboard_id),
  });
  const permittedDashboardIds = permittedDashboards.map(d => d.id);

  dbConditions['dashboard.id'] = mergeFilter(permittedDashboardIds, dbConditions['dashboard.id']);

  return dbConditions;
};
