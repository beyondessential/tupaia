import { SyncDirections } from '@tupaia/constants';

import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';

export class DhisInstanceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DHIS_INSTANCE;
}

export class DhisInstanceModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DhisInstanceRecord;
  }
}
