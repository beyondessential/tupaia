import { BulkCreateHandler } from '../CreateHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertUserEntityPermissionUpsertPermissions } from './assertUserEntityPermissionPermissions';

/**
 * Handles POST endpoints:
 * - /userEntityPermissions
 */

export class CreateUserEntityPermissions extends BulkCreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create user entity permissions',
      ),
    );
  }

  async createRecords(transactingModels, newRecordData) {
    for (const recordData of newRecordData) {
      await this.checkPermissions(transactingModels, recordData);
    }

    return this.insertRecords(transactingModels, newRecordData);
  }

  async checkPermissions(models, newRecord) {
    const userEntityPermissionsChecker = accessPolicy =>
      assertUserEntityPermissionUpsertPermissions(accessPolicy, models, newRecord);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionsChecker]),
    );
  }
}
