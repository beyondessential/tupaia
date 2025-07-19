import { SyncDirections } from '@tupaia/constants';

import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class TombstoneRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.TOMBSTONE;
}

export class TombstoneModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return TombstoneRecord;
  }
}
