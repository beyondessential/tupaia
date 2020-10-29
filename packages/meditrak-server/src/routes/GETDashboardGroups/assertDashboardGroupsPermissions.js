/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { hasAccessToEntityForVisualisation } from '../utilities';

const { RAW } = QUERY_CONJUNCTIONS;

export const hasDashboardGroupsPermissions = async (accessPolicy, models, dashboardGroup) => {
  const entity = await models.entity.findOne({ code: dashboardGroup.organisationUnitCode });
  return hasAccessToEntityForVisualisation(accessPolicy, models, entity, dashboardGroup.userGroup);
};

export const assertDashboardGroupsPermissions = async (accessPolicy, models, dashboardGroupId) => {
  const dashboardGroup = await models.dashboardGroup.findById(dashboardGroupId);
  if (!dashboardGroup) {
    throw new Error(`No dashboard group exists with id ${dashboardGroupId}`);
  }
  if (await hasDashboardGroupsPermissions(accessPolicy, models, dashboardGroup)) {
    return true;
  }
  throw new Error('Requires access to the user group for the country this dashboard group is in');
};

export const createDashboardGroupDBFilter = async (accessPolicy, models, criteria) => {
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
      -- look up the country code of the entity, and see whether it's in the user's list of countries
      -- for the appropriate permission group
      (
        ARRAY(
          SELECT entity.country_code FROM entity WHERE entity.code = "dashboardGroup"."organisationUnitCode"
        )::TEXT[]
        <@
        ARRAY(
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"dashboardGroup"."userGroup")::TEXT)
        )
      )

      -- for projects, pull the country codes from the child entities and check that there is overlap
      -- with the user's list of countries for the appropriate permission group (i.e., they have
      -- access to at least one country within the project)
      OR (
        ARRAY(
          SELECT entity.country_code
            FROM entity
            INNER JOIN entity_relation
              ON entity.id = entity_relation.child_id
            INNER JOIN project
              ON  entity_relation.parent_id = project.entity_id
              AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
            WHERE project.code = "dashboardGroup"."organisationUnitCode"
        )::TEXT[]
        &&
        ARRAY(
          SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"dashboardGroup"."userGroup")::TEXT)
        )
      )
    )`,
    parameters: [
      JSON.stringify(countryCodesByPermissionGroup),
      JSON.stringify(countryCodesByPermissionGroup),
    ],
  };
  return dbConditions;
};
