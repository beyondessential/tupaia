/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import flattenDeep from 'lodash.flattendeep';
import keyBy from 'lodash.keyby';

import { hasAccessToEntityForVisualisation } from '../utilities';

export const filterDashboardReportsByPermissions = async (
  accessPolicy,
  models,
  dashboardReports,
) => {
  const dashboardReportIds = dashboardReports.map(d => d.id);
  const dashboardGroupsGroupedByReportId = await models.dashboardGroup.findDashboardGroupsGroupedByReportId(
    dashboardReportIds,
  );
  const allDashboardGroups = flattenDeep(Object.values(dashboardGroupsGroupedByReportId));
  const allEntityCodes = [...new Set(allDashboardGroups.map(dg => dg.organisationUnitCode))];
  const entities = await models.entity.find({ code: allEntityCodes });
  const entityByCode = keyBy(entities, 'code');
  const dashboardReportById = keyBy(dashboardReports, 'id');
  const accessCache = {}; //Cache the access so that we don't have to recheck for some dashboard reports
  const filteredDashboardReports = [];

  for (let i = 0; i < Object.entries(dashboardGroupsGroupedByReportId).length; i++) {
    const entry = Object.entries(dashboardGroupsGroupedByReportId)[i];
    const [dashboardReportId, dashboardGroups] = entry;
    let hasAccessToDashboardReport = false;

    for (let j = 0; j < dashboardGroups.length; j++) {
      const dashboardGroup = dashboardGroups[j];
      const { userGroup: permissionGroup, organisationUnitCode } = dashboardGroup;
      const entity = entityByCode[organisationUnitCode];

      //permissionGroup and organisationUnitCode are the 2 values for checking access for a dashboard group
      //If there are multiple dashboardGroups having the same permissionGroup and organisationUnitCode, we can reuse the same access value.
      let hasAccessToDashboardGroup = accessCache[`${permissionGroup}|${organisationUnitCode}`];

      if (hasAccessToDashboardGroup === undefined) {
        hasAccessToDashboardGroup = await hasAccessToEntityForVisualisation(
          accessPolicy,
          models,
          entity,
          permissionGroup,
        );
        accessCache[`${permissionGroup}|${organisationUnitCode}`] = hasAccessToDashboardGroup;
      }

      //If a user has access to 1 dashboard group of a report => the user is allowed to see the report.
      if (hasAccessToDashboardGroup) {
        hasAccessToDashboardReport = true;
        break;
      }
    }

    if (hasAccessToDashboardReport) {
      filteredDashboardReports.push(dashboardReportById[dashboardReportId]);
    }
  }
  return filteredDashboardReports;
};

export const assertDashboardReportsPermissions = async (accessPolicy, models, dashboardReport) => {
  const filteredDashboardReports = await filterDashboardReportsByPermissions(accessPolicy, models, [
    dashboardReport,
  ]);

  if (!filteredDashboardReports.length) {
    throw new Error('You do not have permissions for this dashboard report');
  }

  return true;
};
