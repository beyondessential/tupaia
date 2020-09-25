/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
} from '../../permissions';
import { assertUserEntityPermissionPermissions } from './assertUserEntityPermissionPermissions';

/**
 * Handles PUT endpoints:
 * - /userEntityPermissions/:userEntityPermissionId
 */

export class EditUserEntityPermissions extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to edit user entity permissions',
      ),
    );
  }

  async editRecord() {
    // Check Permissions
    const userEntityPermission = await this.models.userEntityPermission.findById(this.recordId);
    const userEntityPermissionChecker = accessPolicy =>
      assertUserEntityPermissionPermissions(accessPolicy, this.models, userEntityPermission);
    this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionChecker]),
    );

    // Update Record
    this.updateRecord();
  }
}
