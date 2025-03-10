import { EditHandler } from '../EditHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardRelationEditPermissions } from './assertDashboardRelationsPermissions';

export class EditDashboardRelation extends EditHandler {
  async assertUserHasAccess() {
    const dashboardRelationChecker = accessPolicy =>
      assertDashboardRelationEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardRelationChecker]),
    );
  }

  async editRecord() {
    await this.updateRecord();
  }
}
