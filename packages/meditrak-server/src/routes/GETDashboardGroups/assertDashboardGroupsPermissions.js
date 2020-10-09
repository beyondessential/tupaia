/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertDashboardGroupsPermissions = async (accessPolicy, models, dashboardGroupId) => {
  const dashboardGroup = await models.dashboardGroup.findById(dashboardGroupId);
  if (accessPolicy.allows(dashboardGroup.organisationUnitCode, dashboardGroup.userGroup)) {
    return true;
  }

  throw new Error('Requires access to the user group for the country this dashboard group is in');
};

export const createDashboardGroupDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = criteria;
  const allPermissionGroups = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroup = {};

  // Generate lists of country codes we have access to per permission group
  allPermissionGroups.forEach(pg => {
    countryCodesByPermissionGroup[pg] = accessPolicy.getEntitiesAllowed(pg);
  });

  // Look up the country codes from the json permissions object and compare to the organisationUnitCode
  // OR
  // For Projects: Pull the country codes from the children entities and compare to the json permissions object
  dbConditions[RAW] = {
    sql: `(ARRAY["organisationUnitCode"] <@ ARRAY(SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"userGroup")::TEXT)))
          OR
          (ARRAY(SELECT entity.country_code
                 FROM entity
                 INNER JOIN entity_relation
                       ON entity.id = entity_relation.child_id
                 INNER JOIN project
                       ON  entity_relation.parent_id = project.entity_id
                       AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
                 WHERE project.code = "dashboardGroup"."organisationUnitCode")::TEXT[]
        && ARRAY(SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"userGroup")::TEXT)))`,
    parameters: [
      JSON.stringify(countryCodesByPermissionGroup),
      JSON.stringify(countryCodesByPermissionGroup),
    ],
  };
  return dbConditions;
};
