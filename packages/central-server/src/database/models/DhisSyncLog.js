import { DatabaseModel, DatabaseRecord, RECORDS } from '@tupaia/database';

class DhisSyncLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DHIS_SYNC_LOG;
}

export class DhisSyncLogModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DhisSyncLogRecord;
  }
}
