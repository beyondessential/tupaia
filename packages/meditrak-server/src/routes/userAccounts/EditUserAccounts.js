/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertTupaiaAdminPanelAccess,
} from '../../permissions';
import { assertUserAccountPermissions } from './assertUserAccountPermissions';

/**
 * Handles PUT endpoints:
 * - /users/:userId
 */

export class EditUserAccounts extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertTupaiaAdminPanelAccess],
        'You need either BES Admin or Tupaia Admin Panel access to edit user accounts',
      ),
    );
  }

  async editRecord() {
    // Check Permissions
    const userAccountChecker = accessPolicy =>
      assertUserAccountPermissions(accessPolicy, this.models, this.recordId);
    await this.assertPermissions(assertAnyPermissions([assertBESAdminAccess, userAccountChecker]));

    // Update Record
    const { password, ...restOfUpdatedFields } = this.updatedFields;
    let updatedFields = restOfUpdatedFields;
    if (password) {
      updatedFields = {
        ...updatedFields,
        ...hashAndSaltPassword(password),
      };
    }
    return this.models.user.updateById(this.recordId, updatedFields);
  }
}
