import { isNotNullish } from '@tupaia/tsutils';
import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardGetPermissions } from '../dashboards/assertDashboardsPermissions';
import { assertIsOwnEmail } from './assertDashboardMailingListEntryPermissions';

export class EditDashboardMailingListEntry extends EditHandler {
  async assertUserHasAccess() {
    const dashboardMailingListEntry = await this.models.dashboardMailingListEntry.findById(
      this.recordId,
    );
    const dashboard = await dashboardMailingListEntry.dashboard();
    const dashboardEditChecker = accessPolicy =>
      assertDashboardGetPermissions(accessPolicy, this.models, dashboard.id);

    const isOwnEmailChecker = () =>
      assertIsOwnEmail(this.req.userId, this.models, dashboardMailingListEntry.email);

    // User either has read access to the dashboard or it's their own email in order to edit a mailing list entry
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardEditChecker, isOwnEmailChecker]),
    );

    const newDashboardMailingListId =
      this.updatedFields.dashboard_mailing_list_id ||
      dashboardMailingListEntry.dashboard_mailing_list_id;
    const newMailingList = await this.models.dashboardMailingList.findById(
      newDashboardMailingListId,
    );
    const subscribed = isNotNullish(this.updatedFields.subscribed)
      ? this.updatedFields.subscribed
      : dashboardMailingListEntry.subscribed;

    if (subscribed) {
      // If we are subscribing, must have read access to the dashboard to update the mailing list entry
      const dashboardReadChecker = accessPolicy =>
        assertDashboardGetPermissions(accessPolicy, this.models, newMailingList.dashboard_id);
      await this.assertPermissions(
        assertAnyPermissions([assertBESAdminAccess, dashboardReadChecker]),
      );
    }
  }

  async editRecord() {
    await this.updateRecord();
  }
}
