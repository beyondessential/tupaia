import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class AnalyticsRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ANALYTICS;
}

export class AnalyticsModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return AnalyticsRecord;
  }
}
