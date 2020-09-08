/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DashboardGroupModel as CommonDashboardGroupModel } from '@tupaia/database';

export class DashboardGroupModel extends CommonDashboardGroupModel {
  // Return all dashboardGroups with matching organisationLevel and organisationUnits
  async getAllDashboardGroups(organisationLevel, entity, projectCode, hierarchyId) {
    return this.fetchDashboardGroups(
      entity,
      hierarchyId,
      this.buildDashboardGroupQueryParams(projectCode, { organisationLevel }),
    );
  }

  // Return dashboardGroup with matching userGroups, organisationLevel and organisationUnits
  async getDashboardGroups(userGroups = [], organisationLevel, entity, projectCode, hierarchyId) {
    return this.fetchDashboardGroups(
      entity,
      hierarchyId,
      this.buildDashboardGroupQueryParams(projectCode, {
        organisationLevel,
        userGroup: userGroups,
      }),
    );
  }

  async fetchDashboardGroups(entity, hierarchyId, params) {
    const ancestorCodes = await entity.getAncestorCodes(hierarchyId);
    const entityCodes = [...ancestorCodes, entity.code];
    const results = await this.find({
      ...params,
      organisationUnitCode: entityCodes,
    });
    const dashboardGroups = {};
    results.forEach(dashboardGroup => {
      const { name, userGroup, organisationUnitCode } = dashboardGroup;
      if (!dashboardGroups[name]) {
        dashboardGroups[name] = {};
      }
      // Add the current element to the return JSON, unless there is already an element with the
      // same nameKey, userGroupKey combo that is for an organisation unit later in the
      // array of organisation units. This way child org units will take the dashboards of their
      // parents where provided, but parent dashboards will be overriden by more specific dashboards
      if (
        !dashboardGroups[name][userGroup] ||
        entityCodes.indexOf(dashboardGroups[name][userGroup].organisationUnitCode) >
          entityCodes.indexOf(organisationUnitCode)
      ) {
        dashboardGroups[name][userGroup] = dashboardGroup;
      }
    });

    return dashboardGroups;
  }

  buildDashboardGroupQueryParams(projectCode, params) {
    return {
      ...params,
      projectCodes: {
        comparator: '@>',
        comparisonValue: [projectCode],
      },
    };
  }
  /* eslint-disable */
  /*
  sample query for getUserGroupConfig:
  SELECT userGroup, organisationLevel,
          organisationUnitCode, dashboardReports, id as dashboardGroupId, name
  FROM dashboardGroup WHERE organisationLevel='Province'
    AND userGroup IN ['Public', 'Admin']
    AND organisationUnitCode in ['rXCRwvytBu3', 'nckZedYVHfU', 'egzxPPDrsiZ']
  ORDER BY FIELD(organisationUnitCode, 'rXCRwvytBu3','nckZedYVHfU','egzxPPDrsiZ') DESC

*******************************************************************************
  results:

  [ RowDataPacket {
    userGroup: 'Public',
    organisationLevel: 'Province',
    organisationUnitCode: 'egzxPPDrsiZ',
    dashboardReports: [1, 15, 3],
    dashboardGroupId: 1,
    name: 'General' },
  RowDataPacket {
    userGroup: 'Admin',
    organisationLevel: 'Province',
    organisationUnitCode: 'egzxPPDrsiZ',
    dashboardReports: [1, 15, 3],
    dashboardGroupId: 3,
    name: 'General' },
  RowDataPacket {
    userGroup: 'Admin',
    organisationLevel: 'Province',
    organisationUnitCode: 'rXCRwvytBu3',
    dashboardReports: [1, 15, 3],
    dashboardGroupId: 4,
    name: 'General' } ]
*******************************************************************************
  passed to callback:

  { Public:
     RowDataPacket {
       userGroup: 'Public',
       organisationLevel: 'Province',
       organisationUnitCode: 'egzxPPDrsiZ',
       dashboardReports: [1, 15, 3],
       dashboardGroupId: 1,
       name: 'General' },
    Admin:
     RowDataPacket {
       userGroup: 'Admin',
       organisationLevel: 'Province',
       organisationUnitCode: 'rXCRwvytBu3',
       dashboardReports: [1, 15, 3],
       dashboardGroupId: 4,
       name: 'General' } }

  */
  /* eslint-enable */
}
