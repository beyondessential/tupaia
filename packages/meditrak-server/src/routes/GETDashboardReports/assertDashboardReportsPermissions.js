/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { flatten } from 'lodash';
import { hasBESAdminAccess } from '../../permissions';
import {
  createDashboardGroupDBFilter,
  hasDashboardGroupsPermissions,
} from '../GETDashboardGroups/assertDashboardGroupsPermissions';

export const assertDashboardReportsPermissions = async (
  accessPolicy,
  models,
  dashboardReportId,
) => {
  const dashboardGroups = await models.dashboardGroup.findDashboardGroupsByReportId([
    dashboardReportId,
  ]);

  // If the user has permission for any of the groups this report is in
  // they have permission for the report
  for (const dashboardGroup of dashboardGroups[dashboardReportId]) {
    if (await hasDashboardGroupsPermissions(accessPolicy, models, dashboardGroup)) {
      return true;
    }
  }

  throw new Error('Requires access to one of the dashboard groups this report is in');
};

export const createDashboardReportDBFilter = async (accessPolicy, models, criteria) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return criteria;
  }

  // Pull the list of dashboard groups we have access to, then pull the dashboard reports
  // we have permission to from that
  const dashboardGroupsConditions = await createDashboardGroupDBFilter(accessPolicy, models);
  const permittedDashboardGroups = await models.dashboardGroup.find(dashboardGroupsConditions);
  const permittedDashboardReportIds = flatten(
    permittedDashboardGroups.map(dg => dg.dashboardReports),
  );

  const dbConditions = {
    'dashboardReport.id': permittedDashboardReportIds,
    ...criteria,
  };

  return dbConditions;
};
