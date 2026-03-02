import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class LegacyReportRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.LEGACY_REPORT;
}

export class LegacyReportModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return LegacyReportRecord;
  }
}
