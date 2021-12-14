/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DeleteHandler } from '../DeleteHandler';
import {
  assertAllPermissions,
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertDataGroupPermissions } from './assertDataGroupPermissions';

export class DeleteDataGroups extends DeleteHandler {
  async assertUserHasAccess() {
    // User has access to all child data_elements of the data_group, plus tupaia admin panel
    // Or is a BES admin
    const dataGroupPermissionChecker = accessPolicy =>
      assertDataGroupPermissions(accessPolicy, this.models, this.recordId);

    await this.assertPermissions(
      assertAnyPermissions([
        assertBESAdminAccess,
        assertAllPermissions([assertAdminPanelAccess, dataGroupPermissionChecker]),
      ]),
    );
  }
}
