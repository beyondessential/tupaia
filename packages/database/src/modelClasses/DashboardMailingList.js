import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DashboardMailingListRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD_MAILING_LIST;
}

export class DashboardMailingListModel extends DatabaseModel {
  get DatabaseRecordClass() {
    return DashboardMailingListRecord;
  }
}
