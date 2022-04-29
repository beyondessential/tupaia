/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardItemEditPermissions } from './assertDashboardItemsPermissions';

export class DeleteDashboardItem extends DeleteHandler {
  async assertUserHasAccess() {
    const dashboardItemChecker = accessPolicy =>
      assertDashboardItemEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardItemChecker]),
    );
  }

  async deleteRecord() {
    const dashboardItem = await this.resourceModel.findById(this.recordId);
    if (dashboardItem.report_code) {
      const reportModel = dashboardItem.legacy ? this.models.legacyReport : this.models.report;
      await reportModel.delete({ code: dashboardItem.report_code });
    }
    return super.deleteRecord();
  }
}
