import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class AccessRequestRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ACCESS_REQUEST;
}

export class AccessRequestModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return AccessRequestRecord;
  }
}
