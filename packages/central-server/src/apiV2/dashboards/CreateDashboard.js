import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertVizBuilderAccess,
} from '../../permissions';
import { assertDashboardCreatePermissions } from './assertDashboardsPermissions';

export class CreateDashboard extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertVizBuilderAccess],
        'You require Viz Builder User or BES Admin permission to create a dashboard.',
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
