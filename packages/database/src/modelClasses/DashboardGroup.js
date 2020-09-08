/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { QUERY_CONJUNCTIONS } from '../TupaiaDatabase';
const { RAW } = QUERY_CONJUNCTIONS;

class DashboardGroupType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_GROUP;
}

export class DashboardGroupModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardGroupType;
  }

  async findDashboardGroupsByReportId(dashboardReportIds) {
    const dashboardGroupsContainingReports = await this.find({
      [RAW]: {
        sql: ':dashboardReportIds && "dashboardReports"',
        parameters: {
          dashboardReportIds,
        },
      },
    });

    const dashboardGroupsGroupedByReportId = {};

    dashboardReportIds.forEach(dashboardReportId => {
      dashboardGroupsGroupedByReportId[
        dashboardReportId
      ] = dashboardGroupsContainingReports.filter(dashboardGroup =>
        dashboardGroup.dashboardReports.includes(dashboardReportId),
      );
    });

    return dashboardGroupsGroupedByReportId;
  }
}
