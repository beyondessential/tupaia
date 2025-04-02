import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class ApiRequestLogRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.API_REQUEST_LOG;
}

export class ApiRequestLogModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return ApiRequestLogRecord;
  }
}
