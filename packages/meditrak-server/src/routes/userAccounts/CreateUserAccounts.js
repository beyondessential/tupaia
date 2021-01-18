/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { hashAndSaltPassword, encryptPassword } from '@tupaia/auth';
import { generateSecretKey } from '@tupaia/utils';
import { CreateHandler } from '../CreateHandler';
import { assertBESAdminAccess } from '../../permissions';

/**
 * Handles POST endpoints:
 * - /users
 */

export class CreateUserAccounts extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertBESAdminAccess);
  }

  async createRecord() {
    return this.createUserRecord(this.newRecordData);
  }

  async createUserRecord({
    firstName,
    lastName,
    emailAddress,
    contactNumber,
    password,
    countryName = 'Demo Land',
    permissionGroupName,
    is_api_client: isApiClient,
    verifiedEmail,
    ...restOfUser
  }) {
    return this.models.wrapInTransaction(async transactingModels => {
      const permissionGroup = await transactingModels.permissionGroup.findOne({
        name: permissionGroupName,
      });
      const country = await transactingModels.entity.findOne({
        name: countryName,
        type: 'country',
      });

      if (!permissionGroup) {
        throw new Error(`No such permission group: ${permissionGroupName}`);
      }

      if (!country) {
        throw new Error(`No such country: ${countryName}`);
      }

      const user = await transactingModels.user.create({
        first_name: firstName,
        last_name: lastName,
        email: emailAddress,
        mobile_number: contactNumber,
        ...hashAndSaltPassword(password),
        verified_email: verifiedEmail,
        ...restOfUser,
      });

      await transactingModels.userEntityPermission.findOrCreate({
        user_id: user.id,
        entity_id: country.id,
        permission_group_id: permissionGroup.id,
      });

      let secretKey;
      if (isApiClient) {
        secretKey = await generateSecretKey();
        await transactingModels.apiClient.create({
          username: user.email,
          user_account_id: user.id,
          secret_key_hash: encryptPassword(secretKey, process.env.API_CLIENT_SALT),
        });
      }

      return { userId: user.id, secretKey };
    });
  }
}
