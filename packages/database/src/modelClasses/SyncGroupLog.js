import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class SyncGroupLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_GROUP_LOG;
}

export class SyncGroupLogModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return SyncGroupLogRecord;
  }
}
