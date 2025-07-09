import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ApiRequestLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.API_REQUEST_LOG;
}

export class ApiRequestLogModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return ApiRequestLogRecord;
  }
}
