import { SyncDirections } from '@tupaia/constants';
import { JOIN_TYPES } from '../BaseDatabase';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class UserCountryAccessAttemptRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_COUNTRY_ACCESS_ATTEMPT;

  // Join to user table to get user details
  static joins = /** @type {const} */ ([
    {
      joinWith: RECORDS.USER_ACCOUNT,
      joinAs: 'user',
      joinType: JOIN_TYPES.LEFT,
      joinCondition: ['user_id', 'user.id'],
      fields: { email: 'user_email', first_name: 'user_first_name', last_name: 'user_last_name' },
    },
  ]);

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
