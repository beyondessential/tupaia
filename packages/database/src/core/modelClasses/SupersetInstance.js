import { SyncDirections } from '@tupaia/constants';

import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';

export class SupersetInstanceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SUPERSET_INSTANCE;
}

export class SupersetInstanceModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SupersetInstanceRecord;
  }
}
