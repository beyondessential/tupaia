import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SyncDeviceTickRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_DEVICE_TICK;
}

export class SyncDeviceTickModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return SyncDeviceTickRecord;
  }
}
