import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DataServiceEntityRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DATA_SERVICE_ENTITY;
}

export class DataServiceEntityModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DataServiceEntityRecord;
  }
}
