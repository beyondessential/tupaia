import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

class DashboardReportRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD_REPORT;
}

export class DashboardReportModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DashboardReportRecord;
  }
}
