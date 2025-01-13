/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import {
  hasAccessToEntityForVisualisation,
  hasVizBuilderAccessToEntityForVisualisation,
} from '../utilities';

export const hasDashboardRelationGetPermissions = async (
  accessPolicy,
  models,
  permissionGroups,
  entityCode,
) => {
  const entity = await models.entity.findOne({ code: entityCode });
  const permissionGroupAccessResults = await Promise.all(
    permissionGroups.map(async pg =>
      hasAccessToEntityForVisualisation(accessPolicy, models, entity, pg),
    ),
  );
  return permissionGroupAccessResults.some(pg => pg === true);
};

export const hasDashboardRelationEditPermissions = async (
  accessPolicy,
  models,
  permissionGroups,
  entityCode,
) => {
  const entity = await models.entity.findOne({ code: entityCode });

  // users should all the permission group access (that's why using every() below)
  const permissionGroupAccessResults = await Promise.all(
    permissionGroups.map(async pg =>
      hasAccessToEntityForVisualisation(accessPolicy, models, entity, pg),
    ),
  );

  return permissionGroupAccessResults.every(pg => pg === true);
};

export const assertDashboardRelationGetPermissions = async (
  accessPolicy,
  models,
  dashboardRelationId,
) => {
  const dashboardRelation = await models.dashboardRelation.findById(dashboardRelationId);
  const dashboard = await models.dashboard.findById(dashboardRelation.dashboard_id);

  // To view a dashboard relation, the user has to have any permission groups (specified in relation) access to the
  // root entity code of the dashboard
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

  throw new Error(
    `Requires any of the permission groups (${dashboardRelation.permission_groups.toString()}) access to the dashboard root entity code '${
      dashboard.root_entity_code
    }'`,
  );
};

export const assertDashboardRelationEditPermissions = async (
  accessPolicy,
  models,
  dashboardRelationId,
) => {
  const dashboardRelation = await models.dashboardRelation.findById(dashboardRelationId);
  const dashboard = await models.dashboard.findById(dashboardRelation.dashboard_id);

  // To edit a dashboard relation, the user has to have all permission groups (specified in relation) access to the
  // root entity code of the dashboard
  if (
    !(await hasDashboardRelationEditPermissions(
      accessPolicy,
      models,
      dashboardRelation.permission_groups,
      dashboard.root_entity_code,
    ))
  ) {
    throw new Error(
      `Requires all of the permission groups (${dashboardRelation.permission_groups.toString()}) access to the dashboard root entity code '${
        dashboard.root_entity_code
      }', and have Tupaia Admin Panel access to '${dashboard.root_entity_code}'`,
    );
  }

  return true;
};

export const assertDashboardRelationCreatePermissions = async (
  accessPolicy,
  models,
  { dashboard_id: dashboardId },
) => {
  const dashboard = await models.dashboard.findById(dashboardId);
  if (!dashboard) {
    throw new Error(`Cannot find dashboard with id ${dashboardId}`);
  }

  const entity = await models.entity.findOne({ code: dashboard.root_entity_code });

  if (!(await hasVizBuilderAccessToEntityForVisualisation(accessPolicy, models, entity))) {
    throw new Error(
      `Requires Tupaia Admin Panel access to the dashboard root entity code '${dashboard.root_entity_code}'`,
    );
  }

  return true;
};
