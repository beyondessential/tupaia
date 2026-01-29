import { GETHandler } from '../GETHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import {
  assertUserEntityPermissionPermissions,
  createUserEntityPermissionDBFilter,
} from './assertUserEntityPermissionPermissions';

/**
 * Handles endpoints:
 * - /userEntityPermissions
 * - /userEntityPermissions/:userEntityPermissionId
 */

export class GETUserEntityPermissions extends GETHandler {
  permissionsFilteredInternally = /** @type {const} */ (true);

  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to user entity permissions',
      ),
    );
  }

  async findSingleRecord(userEntityPermissionId, options) {
    const userEntityPermission = await super.findSingleRecord(userEntityPermissionId, options);

    const userEntityPermissionChecker = accessPolicy =>
      assertUserEntityPermissionPermissions(accessPolicy, this.models, userEntityPermissionId);

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionChecker]),
    );

    return userEntityPermission;
  }

  async getPermissionsFilter(criteria, options) {
    const dbConditions = await createUserEntityPermissionDBFilter(
      this.accessPolicy,
      this.models,
      criteria,
    );
    return { dbConditions, dbOptions: options };
  }

  async getPermissionsViaParentFilter(criteria, options) {
    // Add additional filter by user id
    const dbConditions = {
      'user_entity_permission.user_id': this.parentRecordId,
      ...criteria,
    };

    return this.getPermissionsFilter(dbConditions, options);
  }
}
