/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class UserFavouriteDashboardItemType extends DatabaseType {
  static databaseType = TYPES.USER_FAVOURITE_DASHBOARD_ITEM;

  static joins = [
    {
      fields: {
        code: 'dashboard_item_code',
      },
      joinWith: TYPES.DASHBOARD_ITEM,
      joinCondition: ['dashboard_item.id', 'user_favourite_dashboard_item.dashboard_item_id'],
    },
  ];
}

export class UserFavouriteDashboardItemModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserFavouriteDashboardItemType;
  }

  async favourite(userId, dashboardItemId) {
    return this.findOrCreate({ dashboard_item_id: dashboardItemId, user_id: userId });
  }

  async unfavourite(userId, dashboardItemId) {
    return this.delete({ dashboard_item_id: dashboardItemId, user_id: userId });
  }
}
