import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class MeditrakDeviceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MEDITRAK_DEVICE;
}

export class MeditrakDeviceModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return MeditrakDeviceRecord;
  }
}
