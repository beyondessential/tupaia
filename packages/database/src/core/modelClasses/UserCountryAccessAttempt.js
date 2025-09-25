import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { JOIN_TYPES } from '../BaseDatabase';

export class UserCountryAccessAttemptRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_COUNTRY_ACCESS_ATTEMPT;

  // Join to user table to get user details
  static joins = [
    {
      joinWith: RECORDS.USER_ACCOUNT,
      joinAs: 'user',
      joinType: JOIN_TYPES.LEFT,
      joinCondition: ['user_id', 'user.id'],
      fields: { email: 'user_email', first_name: 'user_first_name', last_name: 'user_last_name' },
    },
  ];

  async user() {
    return this.otherModels.user.findById(this.user_id);
  }
}

export class UserCountryAccessAttemptModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return UserCountryAccessAttemptRecord;
  }
}
