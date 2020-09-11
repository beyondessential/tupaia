/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { flattenDeep } from 'lodash';
import { hasBESAdminAccess } from '../../permissions';
import { filterDashboardGroupsByPermissions } from '../GETDashboardGroups/assertDashboardGroupsPermissions';

export const filterDashboardReportsByPermissions = async (
  accessPolicy,
  models,
  dashboardReports,
) => {
  if (hasBESAdminAccess(accessPolicy)) {
    return dashboardReports;
  }

  const dashboardReportIds = dashboardReports.map(d => d.id);
  const dashboardGroupsByReportId = await models.dashboardGroup.findDashboardGroupsByReportId(
    dashboardReportIds,
  );
  //Remove any duplicated dashboard groups because a report can belong to multiple dashboard groups
  const allDashboardGroups = [...new Set(flattenDeep(Object.values(dashboardGroupsByReportId)))];
  const permittedDashboardGroups = await filterDashboardGroupsByPermissions(
    accessPolicy,
    models,
    allDashboardGroups,
  );
  const permittedDashboardGroupIds = permittedDashboardGroups.map(dg => dg.id);
  return dashboardReports.filter(dr => {
    const dashboardGroupsForReport = dashboardGroupsByReportId[dr.id];
    return dashboardGroupsForReport.some(dg => permittedDashboardGroupIds.includes(dg.id));
  });
};

export const assertDashboardReportsPermissions = async (accessPolicy, models, dashboardReports) => {
  const filteredDashboardReports = await filterDashboardReportsByPermissions(
    accessPolicy,
    models,
    dashboardReports,
  );

  if (filteredDashboardReports.length !== dashboardReports.length) {
    throw new Error('You do not have permissions for the requested dashboard report(s)');
  }

  return true;
};
