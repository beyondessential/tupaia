/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DashboardItemRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD_ITEM;
}

export class DashboardItemModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DashboardItemRecord;
  }

  async fetchItemsInDashboard(dashboardId, entityTypes, permissionGroups, projectCodes, criteria) {
    return this.find(
      {
        ...criteria,
        dashboard_id: dashboardId,
        [`${RECORDS.DASHBOARD_RELATION}.permission_groups`]: {
          comparator: '&&', // User has ANY of the permission groups
          comparisonValue: permissionGroups,
        },
        [`${RECORDS.DASHBOARD_RELATION}.project_codes`]: {
          comparator: '@>',
          comparisonValue: projectCodes,
        },
        [`${RECORDS.DASHBOARD_RELATION}.entity_types`]: {
          comparator: '@>',
          comparisonValue: entityTypes,
        },
      },
      {
        joinWith: RECORDS.DASHBOARD_RELATION,
        joinCondition: ['child_id', 'dashboard_item.id'],
        sort: ['sort_order', 'code'],
      },
    );
  }
}
