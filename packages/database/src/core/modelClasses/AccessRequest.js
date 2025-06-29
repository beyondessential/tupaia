import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class AccessRequestRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ACCESS_REQUEST;
}

export class AccessRequestModel extends DatabaseModel {
  syncDirection = SyncDirections.DO_NOT_SYNC;
  
  get DatabaseRecordClass() {
    return AccessRequestRecord;
  }
}
