import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';

export class SupersetInstanceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SUPERSET_INSTANCE;
}

export class SupersetInstanceModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return SupersetInstanceRecord;
  }
}
