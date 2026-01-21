import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SyncLookupRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_LOOKUP;
}

export class SyncLookupModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SyncLookupRecord;
  }
}
