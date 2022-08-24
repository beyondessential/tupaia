/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

class UserFavouriteDashboardItemType extends DatabaseType {
  static databaseType = TYPES.USER_FAVOURITE_DASHBOARD_ITEM;
}

export class UserFavouriteDashboardItemModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return UserFavouriteDashboardItemType;
  }

  async updateRecord({ changeType, record }) {
    switch (changeType) {
      case 'create':
        return this.findOrCreate(record);
      case 'delete':
        return this.delete(record);
      default:
        throw new Error(`Non supported change type: ${changeType}`);
    }
  }
}
