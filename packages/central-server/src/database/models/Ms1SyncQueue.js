import { DatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';

class Ms1SyncQueueRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MS1_SYNC_QUEUE;
}

export class Ms1SyncQueueModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return Ms1SyncQueueRecord;
  }
}
