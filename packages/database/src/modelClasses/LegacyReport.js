import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class LegacyReportRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.LEGACY_REPORT;
}

export class LegacyReportModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return LegacyReportRecord;
  }
}
