/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import {
  hasAccessToEntityForVisualisation,
  hasTupaiaAdminAccessToEntityForVisualisation,
} from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

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

  // users should all the permission group access (that's why using every() here)
  const permissionGroupAccessResults = await Promise.all(
    permissionGroups.map(async pg =>
      hasAccessToEntityForVisualisation(accessPolicy, models, entity, pg),
    ),
  );
  const hasTupaiaAdminAccess = await hasTupaiaAdminAccessToEntityForVisualisation(
    accessPolicy,
    models,
    entity,
  );

  return permissionGroupAccessResults.every(pg => pg === true) && hasTupaiaAdminAccess;
};

export const hasDashboardItemGetPermissions = async (accessPolicy, models, dashboardItemId) => {
  const dashboards = await models.dashboard.findDashboardsByItemId(dashboardItemId);

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
  const dashboards = await models.dashboard.findDashboardsByItemId([dashboardItemId]);

  // To edit a dashboard item, the user has to have access to the relation between the
  // dashboard item and ALL of the dashboards it is in
  for (const dashboard of dashboards) {
    if (
      !(await hasDashboardRelationEditPermissions(
        accessPolicy,
        models,
        dashboard.permissionGroups,
        dashboard.root_entity_code,
      ))
    ) {
      return false;
    }
  }

  return true;
};

export const assertDashboardItemGetPermissions = async (accessPolicy, models, dashboardItemId) => {
  if (hasDashboardItemGetPermissions(accessPolicy, models, dashboardItemId)) {
    return true;
  }

  throw new Error(
    'Requires access to the dashboard item in one of the dashboards this dashboard item is in',
  );
};

export const assertDashboardItemEditPermissions = async (accessPolicy, models, dashboardItemId) => {
  if (hasDashboardItemEditPermissions(accessPolicy, models, dashboardItemId)) {
    return true;
  }

  throw new Error(
    'Requires access to the dashboard item in all of the dashboards this dashboard item is in',
  );
};

export const createDashboardItemsDBFilter = (accessPolicy, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = { ...criteria };
  const allPermissionGroups = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroup = {};

  // Generate lists of country codes we have access to per permission group
  allPermissionGroups.forEach(pg => {
    countryCodesByPermissionGroup[pg] = accessPolicy.getEntitiesAllowed(pg);
  });

  dbConditions[RAW] = {
    sql: `
    (
      (
        -- look up the country code of the entity, and see whether it's in the user's list of countries
        -- for the appropriate permission group
        ARRAY(
          SELECT DISTINCT entity.country_code
          FROM entity
          INNER JOIN dashboard 
            ON entity.code = dashboard.root_entity_code
          INNER JOIN dashboard_relation 
            ON dashboard_relation.dashboard_id = dashboard.id 
            AND dashboard_relation.child_id = "dashboard_item".id
        )::TEXT[]
        &&
        ARRAY(
          SELECT DISTINCT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->dr1.permission_group)::TEXT) 
          FROM (SELECT unnest(permission_groups) AS permission_group 
                FROM dashboard_relation 
                WHERE child_id = "dashboard_item".id) dr1
        )
      -- for projects, pull the country codes from the child entities and check that there is overlap
      -- with the user's list of countries for the appropriate permission group (i.e., they have
      -- access to at least one country within the project)
      OR (
        ARRAY(
          SELECT DISTINCT entity.country_code
          FROM entity
          INNER JOIN entity_relation
            ON entity.id = entity_relation.child_id
          INNER JOIN project
            ON  entity_relation.parent_id = project.entity_id
            AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
          INNER JOIN dashboard ON project.code = dashboard.root_entity_code
          INNER JOIN dashboard_relation 
            ON dashboard_relation.dashboard_id = dashboard.id 
            AND dashboard_relation.child_id = "dashboard_item".id
        )::TEXT[]
        &&
        ARRAY(
          SELECT DISTINCT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->dr2.permission_group)::TEXT) 
          FROM (SELECT unnest(permission_groups) AS permission_group 
                FROM dashboard_relation WHERE child_id = "dashboard_item".id) dr2
        )
      )
    )
    AND EXISTS (SELECT child_id FROM dashboard_relation WHERE child_id = "dashboard_item".id)
  )`,
    parameters: [
      JSON.stringify(countryCodesByPermissionGroup),
      JSON.stringify(countryCodesByPermissionGroup),
    ],
  };
  return dbConditions;
};
