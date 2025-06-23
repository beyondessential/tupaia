import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertUserEntityPermissionEditPermissions } from './assertUserEntityPermissionPermissions';

/**
 * Handles PUT endpoints:
 * - /userEntityPermissions/:userEntityPermissionId
 */

export class EditUserEntityPermissions extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to edit user entity permissions',
      ),
    );
  }

  async editRecord() {
    // Check Permissions
    const userEntityPermissionChecker = accessPolicy =>
      assertUserEntityPermissionEditPermissions(
        accessPolicy,
        this.models,
        this.recordId,
        this.updatedFields,
      );
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionChecker]),
    );

    // Update Record
    return this.updateRecord();
  }
}
