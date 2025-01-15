import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardEditPermissions } from './assertDashboardsPermissions';

export class EditDashboard extends EditHandler {
  async assertUserHasAccess() {
    const dashboardChecker = accessPolicy =>
      assertDashboardEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, dashboardChecker]));
  }

  async editRecord() {
    await this.updateRecord();
  }
}
