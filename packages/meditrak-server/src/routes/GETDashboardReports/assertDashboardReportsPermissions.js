/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { QUERY_CONJUNCTIONS } from '@tupaia/database';
import { hasBESAdminAccess } from '../../permissions';
import { hasDashboardGroupsPermissions } from '../GETDashboardGroups/assertDashboardGroupsPermissions';

const { RAW } = QUERY_CONJUNCTIONS;

export const assertDashboardReportsPermissions = async (
  accessPolicy,
  models,
  dashboardReportId,
) => {
  const dashboardGroups = await models.dashboardGroup.findDashboardGroupsByReportId([
    dashboardReportId,
  ]);

  for (const dg of dashboardGroups[dashboardReportId]) {
    if (await hasDashboardGroupsPermissions(accessPolicy, models, dg)) {
      return true;
    }
  }

  throw new Error('Requires access to one of the dashboard groups this report is in');
};

export const createDashboardReportDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }
  const dbConditions = {...criteria};
  const allPermissionGroups = accessPolicy.getPermissionGroups();
  const countryCodesByPermissionGroup = {};

  // Generate lists of country codes we have access to per permission group
  allPermissionGroups.forEach(pg => {
    countryCodesByPermissionGroup[pg] = accessPolicy.getEntitiesAllowed(pg);
  });

  // Select the dashboardGroups containing the report, check you have access to at least one of them
  dbConditions[RAW] = {
    sql: `(SELECT COUNT(*) FROM "dashboardGroup"
           WHERE ARRAY["dashboardReport".id] <@ "dashboardReports"
           AND
           ((ARRAY(SELECT entity.country_code FROM entity WHERE entity.code = "dashboardGroup"."organisationUnitCode")::TEXT[] <@ ARRAY(SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"userGroup")::TEXT)))
             OR
            (ARRAY(SELECT entity.country_code
                   FROM entity
                   INNER JOIN entity_relation
                         ON entity.id = entity_relation.child_id
                   INNER JOIN project
                         ON  entity_relation.parent_id = project.entity_id
                         AND entity_relation.entity_hierarchy_id = project.entity_hierarchy_id
                   WHERE project.code = "dashboardGroup"."organisationUnitCode")::TEXT[]
          && ARRAY(SELECT TRIM('"' FROM JSON_ARRAY_ELEMENTS(?::JSON->"userGroup")::TEXT)))))
          > 0`,
    parameters: [
      JSON.stringify(countryCodesByPermissionGroup),
      JSON.stringify(countryCodesByPermissionGroup),
    ],
  };
  return dbConditions;
};
