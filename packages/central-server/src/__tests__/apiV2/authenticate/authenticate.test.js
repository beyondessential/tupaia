/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env

import { encryptPassword, hashAndSaltPassword, getTokenClaims } from '@tupaia/auth';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';

import { TestableApp } from '../../testUtilities';

const app = new TestableApp();
const { models } = app;
const { VERIFIED } = models.user.emailVerifiedStatuses;

const userAccountPassword = 'password';
const apiClientSecret = 'api';

let userAccount;
let apiClientUserAccount;

describe('Authenticate', () => {
  beforeAll(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });

    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });

    const { entity: demoEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'DL',
    });

    // Create test users
    userAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'Ash',
      last_name: 'Ketchum',
      email: 'ash-ketchum@pokemon.org',
      ...hashAndSaltPassword(userAccountPassword),
      verified_email: VERIFIED,
    });

    apiClientUserAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'api',
      last_name: 'client',
      email: 'api-client@pokemon.org',
      verified_email: VERIFIED,
    });
    await findOrCreateDummyRecord(models.apiClient, {
      username: apiClientUserAccount.email,
      user_account_id: apiClientUserAccount.id,
      secret_key_hash: encryptPassword(apiClientSecret, process.env.API_CLIENT_SALT),
    });

    // Public Demo Land Permission
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: apiClientUserAccount.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    // Public Laos permission
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
  });

  it('should return user details with apiClient and access policy', async () => {
    const authResponse = await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
      },
      body: {
        emailAddress: userAccount.email,
        password: userAccountPassword,
        deviceName: 'test_device',
      },
    });

    const { accessToken, refreshToken, user: userDetails } = authResponse.body;

    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');
    expect(userDetails.id).toBe(userAccount.id);
    expect(userDetails.email).toBe(userAccount.email);
    expect(userDetails.apiClient).toBe(apiClientUserAccount.email);
    expect(userDetails.accessPolicy).toStrictEqual({ DL: ['Public'], LA: ['Public'] });
    const { userId, apiClientUserId } = getTokenClaims(accessToken);
    expect(userId).toBe(userAccount.id);
    expect(apiClientUserId).toBe(apiClientUserAccount.id);
  });
});
