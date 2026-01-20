import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class SyncGroupLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_GROUP_LOG;
}

export class SyncGroupLogModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SyncGroupLogRecord;
  }
}
