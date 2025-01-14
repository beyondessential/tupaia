import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGetPermissions } from '../dashboards/assertDashboardsPermissions';

export class CreateDashboardMailingListEntry extends CreateHandler {
  async assertUserHasAccess() {
    const dashboardMailingList = await this.models.dashboardMailingList.findById(
      this.newRecordData.dashboard_mailing_list_id,
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
