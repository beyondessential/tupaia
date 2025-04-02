import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';

export class DhisInstanceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DHIS_INSTANCE;
}

export class DhisInstanceModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DhisInstanceRecord;
  }
}
