import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class RefreshTokenRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.REFRESH_TOKEN;

  async meditrakDevice() {
    return (
      this.meditrak_device_id && this.otherModels.meditrakDevice.findById(this.meditrak_device_id)
    );
  }
}

export class RefreshTokenModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return RefreshTokenRecord;
  }
}
