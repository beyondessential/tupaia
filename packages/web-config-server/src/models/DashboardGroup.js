/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { TYPES } from '@tupaia/database';
import { BaseModel } from './BaseModel';

export class DashboardGroup extends BaseModel {
  static databaseType = TYPES.DASHBOARD_GROUP;

  static fields = [
    'id',
    'organisationLevel',
    'userGroup',
    'organisationUnitCode',
    'dashboardReports',
    'name',
    'projectCodes',
  ];

  // Return dashboardGroup with matching userGroups, organisationLevel and organisationUnits
  static async getDashboardGroups(
    userGroups = [],
    organisationLevel,
    entity,
    projectCode,
    hierarchyId,
  ) {
    const ancestorCodes = await entity.getAncestorCodes(true, hierarchyId);
    const entityCodes = [...ancestorCodes, entity.code];
    const results = await DashboardGroup.find({
      organisationLevel,
      userGroup: userGroups, // Passing an array will cause the database to do an 'IN'
      organisationUnitCode: entityCodes, // As above, an array uses 'IN'
      projectCodes: {
        comparator: '@>',
        comparisonValue: [projectCode],
      },
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
