import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertDashboardRelationCreatePermissions } from './assertDashboardRelationsPermissions';

/**
 * Handles POST endpoints:
 * - /dashboardRelations
 */

export class CreateDashboardRelation extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Viz Builder access to create user entity permissions',
      ),
    );
  }

  async createRecord() {
    // Check Permissions
    const dashboardRelationChecker = accessPolicy =>
      assertDashboardRelationCreatePermissions(accessPolicy, this.models, this.newRecordData);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, dashboardRelationChecker]),
    );

    return this.insertRecord();
  }
}
