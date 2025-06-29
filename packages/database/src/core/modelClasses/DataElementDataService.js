import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';
import { DatabaseModel } from '../DatabaseModel';
import { SyncDirections } from '@tupaia/constants';

export class DataElementDataServiceRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_ELEMENT_DATA_SERVICE;
}

export class DataElementDataServiceModel extends DatabaseModel {
  syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DataElementDataServiceRecord;
  }
}
