import { SyncDirections } from '@tupaia/constants';
import { DatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';

class DhisSyncLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DHIS_SYNC_LOG;
}

export class DhisSyncLogModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DhisSyncLogRecord;
  }
}
