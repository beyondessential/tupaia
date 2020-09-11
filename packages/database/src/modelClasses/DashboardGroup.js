/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardGroupType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_GROUP;
}

export class DashboardGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardGroupType;
  }

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
}
