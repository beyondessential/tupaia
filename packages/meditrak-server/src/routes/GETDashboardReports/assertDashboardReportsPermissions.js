/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertDashboardReportsPermissions = async (
  accessPolicy,
  models,
  dashboardReportId,
) => {
  const dashboardGroups = await models.dashboardGroup.findDashboardGroupsByReportId([
    dashboardReportId,
  ]);

  const dashboardGroupsFiltered = dashboardGroups[dashboardReportId].filter(dg => {
    return accessPolicy.allows(dg.organisationUnitCode, dg.userGroup);
  });

  if (dashboardGroupsFiltered.length === 0) {
    throw new Error('Requires access to one of the dashboard groups this report is in');
  }

  return true;
};

export const createDashboardReportDBFilter = async (accessPolicy, models, criteria) => {
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

  // Select the dashboardGroups containing the report, check you have access to at least one of them
  dbConditions[RAW] = {
    sql: `(select count(*) from "dashboardGroup" where array["dashboardReport".id] <@ "dashboardReports" and array["organisationUnitCode"] <@ array(select trim('"' from json_array_elements(?::json->"userGroup")::text))) > 0`,
    parameters: JSON.stringify(countryCodesByPermissionGroup),
  };
  return dbConditions;
};
