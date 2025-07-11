import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class TombstoneRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TOMBSTONE;
}

export class TombstoneModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return TombstoneRecord;
  }
}
