import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertAdminPanelAccess,
  assertBESAdminAccess,
} from '../../permissions';
import { assertDashboardCreatePermissions } from './assertDashboardsPermissions';

export class CreateDashboard extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create a dashboard',
      ),
    );
  }

  async createRecord() {
    // Check Permissions
    const dashboardChecker = accessPolicy =>
      assertDashboardCreatePermissions(accessPolicy, this.models, this.newRecordData);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));

    return this.insertRecord();
  }
}
