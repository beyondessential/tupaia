/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardRelationType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_RELATION;
}

export class DashboardRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardRelationType;
  }

  async findDashboardRelation(dashboardCode, dashboardItemCode) {
    return this.findOne(
      {
        'dashboard.code': dashboardCode,
        'dashboard_item.code': dashboardItemCode,
      },
      {
        multiJoin: [
          {
            joinWith: TYPES.DASHBOARD,
            joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
          },
          {
            joinWith: TYPES.DASHBOARD_ITEM,
            joinCondition: ['dashboard_item.id', 'dashboard_relation.child_id'],
          },
        ],
      },
    );
  }
}
