/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import { assertAnyPermissions, assertBESAdminAccess } from '../../permissions';
import { assertUserEntityPermissionEditPermissions } from './assertUserEntityPermissionPermissions';

/**
 * Handles DELETE endpoints:
 * - /userEntityPermissions/:userEntityPermissionId
 */

export class DeleteUserEntityPermissions extends DeleteHandler {
  async assertUserHasAccess() {
    // Check Permissions
    const userEntityPermissionChecker = accessPolicy =>
      assertUserEntityPermissionEditPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, userEntityPermissionChecker]),
    );
  }
}
