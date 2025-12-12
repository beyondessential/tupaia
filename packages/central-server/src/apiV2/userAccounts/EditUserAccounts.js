import { encryptPassword } from '@tupaia/auth';
import { S3, S3Client } from '@tupaia/server-utils';
import { ValidationError } from '@tupaia/utils';
import { USER_PREFERENCES_FIELDS } from '@tupaia/constants';

import {
  assertAdminPanelAccess,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { EditHandler } from '../EditHandler';
import { assertUserAccountPermissions } from './assertUserAccountPermissions';

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
    const {
      password,
      profile_image: profileImage,
      preferences: preferenceField,
      ...restOfUpdatedFields
    } = this.updatedFields;
    let updatedFields = restOfUpdatedFields;

    if (password) {
      updatedFields.password_hash = await encryptPassword(password);
      // Discard legacy salt used for SHA-256 hashing (redundant if already migrated to Argon2)
      updatedFields.legacy_password_salt = null;
    }

    if (preferenceField) {
      throw new ValidationError(
        'Preferences should be updated via the specific preferences fields',
      );
    }

    updatedFields = await this.models.user.getUpdatedUserPreferenceFields(this.recordId, updatedFields);

    if (profileImage) {
      if (profileImage.data && profileImage.fileId) {
        const s3Client = new S3Client(new S3());
        const profileImagePath = await s3Client.uploadImage(profileImage.data, profileImage.fileId);
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
