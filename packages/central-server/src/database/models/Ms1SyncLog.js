import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';

class Ms1SyncLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MS1_SYNC_LOG;
}

export class Ms1SyncLogModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return Ms1SyncLogRecord;
  }
}
