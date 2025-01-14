import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class MeditrakDeviceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.MEDITRAK_DEVICE;
}

export class MeditrakDeviceModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return MeditrakDeviceRecord;
  }
}
