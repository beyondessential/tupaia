import { CreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertAdminPanelAccess,
  assertBESAdminAccess,
} from '../../permissions';

export class CreateSyncGroups extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create a Sync Group',
      ),
    );
  }

  async createRecord() {
    return this.insertRecord();
  }
}
