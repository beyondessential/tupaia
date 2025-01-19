import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardEditPermissions } from '../dashboards/assertDashboardsPermissions';

export class EditDashboardMailingList extends EditHandler {
  async assertUserHasAccess() {
    const dashboardMailingList = await this.models.dashboardMailingList.findById(this.recordId);
    const existingDashboardEditChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, dashboardMailingList.dashboard_id);

    // User must have edit access to the existing dashboard to edit a mailing list
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, existingDashboardEditChecker]),
    );

    const newDashboardId = this.updatedFields.dashboard_id || dashboardMailingList.dashboard_id;
    const newDashboardEditChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, newDashboardId);
    // User must have edit access to the new dashboard to edit a mailing list
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, newDashboardEditChecker]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
