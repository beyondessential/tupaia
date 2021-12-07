/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { CreateHandler } from '../CreateHandler';
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

export class CreateUserEntityPermissions extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to create user entity permissions',
      ),
    );
  }

  async createRecord() {
    // Check Permissions
    const userEntityPermissionsChecker = accessPolicy =>
      assertUserEntityPermissionUpsertPermissions(accessPolicy, this.models, this.newRecordData);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionsChecker]),
    );

    throw new Error('Bulk Requests Under Construction');

    return this.insertRecord();
  }
}
