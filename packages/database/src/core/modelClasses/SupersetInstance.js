import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';

export class SupersetInstanceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SUPERSET_INSTANCE;
}

export class SupersetInstanceModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SupersetInstanceRecord;
  }
}
