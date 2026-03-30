import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class UserFavouriteDashboardItemRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_FAVOURITE_DASHBOARD_ITEM;

  static joins = /** @type {const} */ ([
    {
      fields: {
        code: 'dashboard_item_code',
      },
      joinWith: RECORDS.DASHBOARD_ITEM,
      joinCondition: ['dashboard_item.id', 'user_favourite_dashboard_item.dashboard_item_id'],
    },
  ]);
}

export class UserFavouriteDashboardItemModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return UserFavouriteDashboardItemRecord;
  }

  async favourite(userId, dashboardItemId) {
    return this.findOrCreate({ dashboard_item_id: dashboardItemId, user_id: userId });
  }

  async unfavourite(userId, dashboardItemId) {
    return this.delete({ dashboard_item_id: dashboardItemId, user_id: userId });
  }
}
