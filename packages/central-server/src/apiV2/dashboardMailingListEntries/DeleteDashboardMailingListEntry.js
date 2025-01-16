import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardEditPermissions } from '../dashboards/assertDashboardsPermissions';
import { assertIsOwnEmail } from './assertDashboardMailingListEntryPermissions';

export class DeleteDashboardMailingListEntry extends DeleteHandler {
  async assertUserHasAccess() {
    const dashboardMailingListEntry = await this.models.dashboardMailingListEntry.findById(
      this.recordId,
    );
    const dashboard = await dashboardMailingListEntry.dashboard();
    // Must have edit permissions to a dashboard to delete entries from mailing list
    const dashboardChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, dashboard.id);

    // Can delete own email from mailing list
    const isOwnEmailChecker = () =>
      assertIsOwnEmail(this.req.userId, this.models, dashboardMailingListEntry.email);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardChecker, isOwnEmailChecker]),
    );
  }
}
