/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword } from '@tupaia/auth';
import { S3Client, S3 } from '@tupaia/server-utils';
import { EditHandler } from '../EditHandler';
import {
  assertAnyPermissions,
  assertBESAdminAccess,
  assertAdminPanelAccess,
} from '../../permissions';
import { assertUserAccountPermissions } from './assertUserAccountPermissions';

/**
 * Handles PUT endpoints:
 * - /users/:userId
 */

const USER_PREFERENCES_FIELDS = [
  'project_id',
  'country_id',
  'delete_account_requested',
  'recent_entities',
  'hide_welcome_screen',
];

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
      updatedFields = {
        ...updatedFields,
        ...hashAndSaltPassword(password),
      };
    }

    if (preferenceField) {
      throw new Error('Preferences should be updated via the specific preferences fields');
    }

    // Check if there are any updated user preferences in the request
    const updatedUserPreferences = Object.entries(updatedFields).filter(([key]) =>
      USER_PREFERENCES_FIELDS.includes(key),
    );
    // If there are, extract them and save them with the existing user preferences
    if (updatedUserPreferences.length > 0) {
      // Remove user preferences fields from updatedFields so they don't get saved else where
      updatedUserPreferences.forEach(([key]) => {
        delete updatedFields[key];
      });

      const userRecord = await this.models.user.findById(this.recordId);
      const { preferences } = userRecord;

      const updatedPreferenceFields = updatedUserPreferences.reduce((obj, [key, value]) => {
        return { ...obj, [key]: value };
      }, preferences);
      // If we change the selected project, we clear out the recent entities
      if (updatedPreferenceFields.project_id) {
        updatedPreferenceFields.recentEntities = {};
      }

      updatedFields = {
        preferences: updatedPreferenceFields,
        ...updatedFields,
      };
    }

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
