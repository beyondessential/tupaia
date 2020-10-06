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

  // Look up the country codes from the json object and compare to the organisationUnitCode
  dbConditions[RAW] = {
    sql: `array["organisationUnitCode"] <@ array(select trim('"' from json_array_elements(?::json->"userGroup")::text))`,
    parameters: JSON.stringify(countryCodesByPermissionGroup),
  };
  return dbConditions;
};
