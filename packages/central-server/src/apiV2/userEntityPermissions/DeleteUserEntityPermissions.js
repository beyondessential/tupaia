import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserEntityPermissionPermissions } from './assertUserEntityPermissionPermissions';

/**
 * Handles DELETE endpoints:
 * - /userEntityPermissions/:userEntityPermissionId
 */

export class DeleteUserEntityPermissions extends DeleteHandler {
  async assertUserHasAccess() {
    // Check Permissions
    const userEntityPermissionChecker = accessPolicy =>
      assertUserEntityPermissionPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionChecker]),
    );
  }
}
