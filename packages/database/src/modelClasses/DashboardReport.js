import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class DashboardReportRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD_REPORT;
}

export class DashboardReportModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DashboardReportRecord;
  }
}
