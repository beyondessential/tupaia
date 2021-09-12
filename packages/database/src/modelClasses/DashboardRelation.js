/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class DashboardRelationType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_RELATION;

  static joins = [
    {
      fields: {
        code: 'dashboard_code',
      },
      joinWith: TYPES.DASHBOARD,
      joinCondition: ['dashboard.id', 'dashboard_relation.dashboard_id'],
    },
    {
      fields: {
        code: 'dashboard_item_code',
      },
      joinWith: TYPES.DASHBOARD_ITEM,
      joinCondition: ['dashboard_item.id', 'dashboard_relation.child_id'],
    },
  ];
}

export class DashboardRelationModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return DashboardRelationType;
  }

  customColumnSelectors = {
    // `entity_types` is enum[] in the DB, which doesn't get parsed into a JS array automatically
    entity_types: () => ({ castAs: 'text[]' }),
  };

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
