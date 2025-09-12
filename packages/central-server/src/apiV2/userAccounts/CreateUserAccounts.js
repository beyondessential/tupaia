import { encryptPassword, generateSecretKey } from '@tupaia/auth';
import { PermissionsError, ValidationError } from '@tupaia/utils';

import {
  assertAdminPanelAccess,
  assertAdminPanelAccessToCountry,
  assertAnyPermissions,
  assertBESAdminAccess,
} from '../../permissions';
import { CreateHandler } from '../CreateHandler';

/**
 * Handles POST endpoints:
 * - /users
 */

export class CreateUserAccounts extends CreateHandler {
  async assertUserHasAccess() {
    await this.assertPermissions(assertAdminPanelAccess);
  }

  async createRecord() {
    return this.models.wrapInTransaction(async transactingModels => {
      const {
        countryName,
        permissionGroupName,
        is_api_client: isApiClient,
        ...restOfUser
      } = this.newRecordData;

      const user = await this.createUserRecord(transactingModels, restOfUser);
      await this.createUserPermission(transactingModels, {
        userId: user.id,
        countryName,
        permissionGroupName,
      });

      let secretKey;
      if (isApiClient) {
        secretKey = await generateSecretKey();
        await transactingModels.apiClient.create({
          username: user.email,
          user_account_id: user.id,
          secret_key_hash: await encryptPassword(secretKey),
        });
      }

      return { userId: user.id, secretKey };
    });
  }

  async createUserPermission(transactingModels, { userId, countryName, permissionGroupName }) {
    const [permissionGroup, country] = await Promise.all([
      transactingModels.permissionGroup.findOne({ name: permissionGroupName }),
      transactingModels.entity.findOne({ name: countryName, type: 'country' }),
    ]);

    if (!permissionGroup) {
      throw new ValidationError(`No such permission group: ${permissionGroupName}`);
    }
    if (!country) {
      throw new ValidationError(`No such country: ${countryName}`);
    }

    const countryPermissionChecker = async accessPolicy => {
      await assertAdminPanelAccessToCountry(accessPolicy, transactingModels, country.id);
      if (!accessPolicy.allows(country.code, permissionGroup.name)) {
        throw new PermissionsError(`Need ${permissionGroup.name} access to ${country.name}`);
      }
    };

    await this.assertPermissions(
      assertAnyPermissions([assertBESAdminAccess, countryPermissionChecker]),
    );

    return transactingModels.userEntityPermission.findOrCreate({
      user_id: userId,
      entity_id: country.id,
      permission_group_id: permissionGroup.id,
    });
  }

  async createUserRecord(
    transactingModels,
    {
      firstName,
      lastName,
      emailAddress,
      contactNumber,
      password,
      primaryPlatform,
      verifiedEmail,
      ...restOfUser
    },
  ) {
    const passwordHash = await encryptPassword(password);

    return transactingModels.user.create({
      first_name: firstName,
      last_name: lastName,
      email: emailAddress,
      mobile_number: contactNumber,
      primary_platform: primaryPlatform,
      password_hash: passwordHash,
      verified_email: verifiedEmail,
      ...restOfUser,
    });
  }
}
