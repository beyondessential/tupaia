/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

export class DashboardMailingListEntryType extends DatabaseType {
  static databaseType = TYPES.DASHBOARD_MAILING_LIST_ENTRY;

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
  get DatabaseTypeClass() {
    return DashboardMailingListEntryType;
  }
}
