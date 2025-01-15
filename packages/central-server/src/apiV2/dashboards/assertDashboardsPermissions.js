import { RECORDS } from '@tupaia/database';
import {
  createDashboardRelationsDBFilter,
  hasDashboardRelationGetPermissions,
  hasDashboardRelationEditPermissions,
} from '../dashboardRelations';
import { hasBESAdminAccess, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../permissions';
import { hasTupaiaAdminAccessToEntityForVisualisation, mergeFilter } from '../utilities';

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

export const getDashboardsDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  const dbConditions = { ...criteria };

  // Pull the list of dashboard relations we have access to,
  // then pull the corresponding dashboards
  const permissionRelationConditions = createDashboardRelationsDBFilter(accessPolicy, criteria);
  const permittedDashboardsFromRelations = await models.dashboard.find(
    permissionRelationConditions,
    {
      joinWith: RECORDS.DASHBOARD_RELATION,
      joinCondition: ['dashboard_relation.dashboard_id', 'dashboard.id'],
    },
  );
  const permittedDashboardIdsFromRelations = permittedDashboardsFromRelations.map(d => d.id);

  // Pull the list of all dashboards with country code that use has Tupaia Admin Panel access to
  const permittedCountryCodes = accessPolicy.getEntitiesAllowed(
    TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  );

  const permittedDashboards = await models.dashboard.find({
    root_entity_code: permittedCountryCodes,
  });

  const permittedDashboardIds = permittedDashboards.map(d => d.id);

  // Combine lists
  const combinedPermittedIds = [...permittedDashboardIdsFromRelations, ...permittedDashboardIds];

  dbConditions['dashboard.id'] = mergeFilter(combinedPermittedIds, dbConditions['dashboard.id']);

  return dbConditions;
};
