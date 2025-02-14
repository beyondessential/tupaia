import { CreateHandler } from '../CreateHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardEditPermissions } from '../dashboards/assertDashboardsPermissions';

export class CreateDashboardMailingList extends CreateHandler {
  async assertUserHasAccess() {
    const dashboardEditChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, this.newRecordData.dashboard_id);

    // User must have edit access to the dashboard in order to create a mailing list
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardEditChecker]),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
