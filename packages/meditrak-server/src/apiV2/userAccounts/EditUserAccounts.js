/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertUserAccountPermissions } from './assertUserAccountPermissions';
import { uploadImage } from '../../s3';

/**
 * Handles PUT endpoints:
 * - /users/:userId
 */

export class EditUserAccounts extends EditHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(
      assertAnyPermissions(
        [assertBESAdminAccess, assertAdminPanelAccess],
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
    const { password, profile_image: profileImage, ...restOfUpdatedFields } = this.updatedFields;
    let updatedFields = restOfUpdatedFields;
    if (password) {
      updatedFields = {
        ...updatedFields,
        ...hashAndSaltPassword(password),
      };
    }

    if (profileImage) {
      if (profileImage.data && profileImage.fileId) {
        const profileImagePath = await uploadImage(profileImage.data, profileImage.fileId);
        updatedFields = {
          ...updatedFields,
          profile_image: profileImagePath,
        };
      } else {
        updatedFields = {
          ...updatedFields,
          profile_image: null,
        };
      }
    }

    return this.models.user.updateById(this.recordId, updatedFields);
  }
}
