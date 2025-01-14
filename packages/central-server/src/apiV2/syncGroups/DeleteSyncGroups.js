import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertSyncGroupEditPermissions } from './assertSyncGroupPermissions';

export class DeleteSyncGroups extends DeleteHandler {
  async assertUserHasAccess() {
    const syncGroupChecker = accessPolicy =>
      assertSyncGroupEditPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, syncGroupChecker]));
  }
}
