import {
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
} from '../dashboardRelations';
import { hasVizBuilderAccessToEntity, hasVizBuilderAccessToEntityCode } from '../utilities';

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

  if (!(await hasVizBuilderAccessToEntity(accessPolicy, models, entity))) {
    throw new Error(`Requires Tupaia Admin Panel access to the entity code: '${rootEntityCode}'`);
  }

  return true;
};

export const assertDashboardEditPermissions = async (
  accessPolicy,
  models,
  dashboardId,
  vizBuilder = true,
) => {
  const dashboard = await models.dashboard.findById(dashboardId);
  const dashboardRelations = await models.dashboardRelation.find({ dashboard_id: dashboardId });

  // If the user has EDIT permission to ALL of the dashboard items in the dashboard,
  // then user has access to edit that dashboard
  const hasAllPermissions = await Promise.all(
    dashboardRelations.map(dashboardRelation =>
      hasDashboardRelationEditPermissions(
        accessPolicy,
        models,
        dashboardRelation.permission_groups,
        dashboard.root_entity_code,
      ),
    ),
  );

  if (!hasAllPermissions.every(permission => permission)) {
    throw new Error(
      `Requires access to all of the dashboard items in this dashboard for ${dashboard.root_entity_code}`,
    );
  }

  if (!vizBuilder) {
    return true;
  }

  // And access to the Viz Builder User Group for the entity
  const hasVizBuilderPermissions = await hasVizBuilderAccessToEntityCode(
    accessPolicy,
    models,
    dashboard.root_entity_code,
  );

  if (!hasVizBuilderPermissions) {
    throw new Error(
      `Requires Viz Builder User to all of the dashboard items in this dashboard for ${dashboard.root_entity_code}`,
    );
  }

  return true;
};
