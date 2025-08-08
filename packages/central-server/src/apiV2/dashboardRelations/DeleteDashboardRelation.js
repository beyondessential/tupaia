import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertDashboardRelationEditPermissions } from './assertDashboardRelationsPermissions';

export class DeleteDashboardRelation extends DeleteHandler {
  async assertUserHasAccess() {
    const permissionsChecker = async accessPolicy =>
      assertDashboardRelationEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, permissionsChecker]));
  }
}
