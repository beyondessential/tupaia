/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import { expect } from 'chai';
import {
  encryptPassword,
  getTokenClaims,
  sha256EncryptPassword,
  verifyPassword,
} from '@tupaia/auth';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';

import { TestableApp } from '../../testUtilities';
import { configureEnv } from '../../../configureEnv';

configureEnv();

const app = new TestableApp();
const { models } = app;
const { VERIFIED } = models.user.emailVerifiedStatuses;

const userAccountPassword = 'password';
const apiClientSecret = 'api';

let userAccount;
let apiClientUserAccount;

describe('Authenticate', function () {
  before(async () => {
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
    const passwordHash = await encryptPassword(userAccountPassword);

    userAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'Ash',
      last_name: 'Ketchum',
      email: 'ash-ketchum@pokemon.org',
      password_hash: passwordHash,
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
      secret_key_hash: await encryptPassword(apiClientSecret),
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

  it('should return user details with apiClient and access policy', async function () {
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

    expect(accessToken).to.be.a('string');
    expect(refreshToken).to.be.a('string');
    expect(userDetails.id).to.equal(userAccount.id);
    expect(userDetails.email).to.equal(userAccount.email);
    expect(userDetails.apiClient).to.equal(apiClientUserAccount.email);
    expect(userDetails.accessPolicy).to.deep.equal({ DL: ['Public'], LA: ['Public'] });
    const { userId, apiClientUserId } = getTokenClaims(accessToken);
    expect(userId).to.equal(userAccount.id);
    expect(apiClientUserId).to.equal(apiClientUserAccount.id);
  });

  it('Should authenticate user who has been migrated to argon2 password hashing', async () => {
    const email = 'peeka@pokemon.org';
    const password = 'oldPassword123!';
    const salt = 'xyz123^';
    const sha256Hash = await sha256EncryptPassword(password, salt);
    const argon2Hash = await encryptPassword(sha256Hash);
    const migratedUser = await findOrCreateDummyRecord(models.user, {
      first_name: 'Peeka',
      last_name: 'Chu',
      email: email,
      password_hash: argon2Hash,
      verified_email: VERIFIED,
    });

    const authResponse = await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
      },
      body: {
        emailAddress: email,
        password: password,
        deviceName: 'test_device',
      },
    });

    expect(authResponse.status).to.equal(200);
    const { accessToken, refreshToken, user: userDetails } = authResponse.body;
    expect(accessToken).to.be.a('string');
    expect(refreshToken).to.be.a('string');
    expect(userDetails.id).to.equal(migratedUser.id);
    expect(userDetails.email).to.equal(migratedUser.email);
  });

  it.only("Should migrate user's password to argon2 after successful login", async () => {
    const email = 'squirtle@pokemon.org';
    const password = 'oldPassword123!';
    const salt = 'xyz123^';
    const sha256Hash = await sha256EncryptPassword(password, salt);
    const argon2Hash = await encryptPassword(sha256Hash, salt);
    const migratedUser = await findOrCreateDummyRecord(models.user, {
      first_name: 'Peeka',
      last_name: 'Chu',
      email: email,
      password_hash: argon2Hash,
      password_salt: salt,
      verified_email: VERIFIED,
    });

    const isVerifiedBefore = await verifyPassword(password, migratedUser.password_hash);
    expect(isVerifiedBefore).to.be.false;

    const authResponse = await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
      },
      body: {
        emailAddress: email,
        password: password,
        deviceName: 'test_device',
      },
    });

    expect(authResponse.status).to.equal(200);

    const userDetails = await models.user.findById(migratedUser.id);
    const isVerifiedAfter = await verifyPassword(password, userDetails.password_hash);
    expect(isVerifiedAfter).to.be.true;
  });
});
