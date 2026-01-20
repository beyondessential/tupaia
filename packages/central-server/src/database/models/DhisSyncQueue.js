import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';

class DhisSyncQueueRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DHIS_SYNC_QUEUE;
}

export class DhisSyncQueueModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DhisSyncQueueRecord;
  }
}
