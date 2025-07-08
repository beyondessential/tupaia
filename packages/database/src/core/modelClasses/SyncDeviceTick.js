import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class SyncDeviceTickRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.SYNC_DEVICE_TICK;
}

export class SyncDeviceTickModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return SyncDeviceTickRecord;
  }
}
