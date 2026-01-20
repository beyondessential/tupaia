import { SyncDirections } from '@tupaia/constants';

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseRecord } from '../DatabaseRecord';
import { RECORDS } from '../records';

export class DashboardMailingListEntryRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.DASHBOARD_MAILING_LIST_ENTRY;

  async mailingList() {
    return this.otherModels.dashboardMailingList.findById(this.dashboard_mailing_list_id);
  }

  async project() {
    const mailingList = await this.mailingList();
    return this.otherModels.project.findById(mailingList.project_id);
  }

  async dashboard() {
    const mailingList = await this.mailingList();
    return this.otherModels.dashboard.findById(mailingList.dashboard_id);
  }

  async entity() {
    const mailingList = await this.mailingList();
    return this.otherModels.entity.findById(mailingList.entity_id);
  }
}

export class DashboardMailingListEntryModel extends DatabaseModel {
  static syncDirection = SyncDirections.DO_NOT_SYNC;

  get DatabaseRecordClass() {
    return DashboardMailingListEntryRecord;
  }
}
