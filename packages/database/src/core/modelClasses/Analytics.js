import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class AnalyticsRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANALYTICS;
}

export class AnalyticsModel extends DatabaseModel {
  syncDirection = SYNC_DIRECTIONS.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return AnalyticsRecord;
  }
}
