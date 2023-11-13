/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import {
  assertDashboardEditPermissions,
  assertDashboardGetPermissions,
} from '../dashboards/assertDashboardsPermissions';
import { assertIsOwnEmail } from './assertDashboardMailingListEntryPermissions';

export class CreateDashboardMailingListEntry extends CreateHandler {
  async assertUserHasAccess() {
    const dashboardMailingList = await this.models.dashboardMailingList.findById(
      this.newRecordData.dashboard_mailing_list_id,
    );
    const dashboardEditChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, dashboardMailingList.dashboard_id);

    const isOwnEmailChecker = () =>
      assertIsOwnEmail(this.req.userId, this.models, this.newRecordData.email);

    // User either has edit access to the dashboard or it's their own email in order to create a mailing list entry
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardEditChecker, isOwnEmailChecker]),
    );

    // Must have read access to the new dashboard to create the mailing list entry
    const dashboardReadChecker = accessPolicy =>
      assertDashboardGetPermissions(accessPolicy, this.models, dashboardMailingList.dashboard_id);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardReadChecker]),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
