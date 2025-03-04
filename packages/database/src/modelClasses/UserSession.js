import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class UserSessionRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.USER_SESSION;
}

export class UserSessionModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return UserSessionRecord;
  }
}
