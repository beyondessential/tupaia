/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardEditPermissions } from '../dashboards/assertDashboardsPermissions';

export class DeleteDashboardMailingList extends DeleteHandler {
  async assertUserHasAccess() {
    const dashboardMailingList = await this.models.dashboardMailingList.findById(this.recordId);
    // Must have edit permissions to a dashboard to delete mailing list
    const dashboardChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, dashboardMailingList.dashboard_id);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));
  }
}
