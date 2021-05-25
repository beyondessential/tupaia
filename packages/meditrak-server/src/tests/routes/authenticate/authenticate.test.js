/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env
import { expect } from 'chai';

import { encryptPassword, hashAndSaltPassword } from '@tupaia/auth';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';

import { TestableApp } from '../../testUtilities';

const app = new TestableApp();
const { models } = app;
const { VERIFIED } = models.user.emailVerifiedStatuses;

const userAccountPassword = 'password';
const simpleApiClientSecret = 'simple';
const multiPermissionApiClientSecret = 'multiPermission';

let userAccount;
let simpleApiUserAccount;
let multiPermissionApiUserAccount;

describe('Authenticate', function () {
  before(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });

    const { entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
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

    simpleApiUserAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'simple',
      last_name: 'api-client',
      email: 'simple-api-client@pokemon.org',
      verified_email: VERIFIED,
    });
    await findOrCreateDummyRecord(models.apiClient, {
      username: simpleApiUserAccount.email,
      user_account_id: simpleApiUserAccount.id,
      secret_key_hash: encryptPassword(simpleApiClientSecret, process.env.API_CLIENT_SALT),
    });

    multiPermissionApiUserAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'multiPermission',
      last_name: 'api-client',
      email: 'multi-permission-api-client@pokemon.org',
      verified_email: VERIFIED,
    });
    await findOrCreateDummyRecord(models.apiClient, {
      username: multiPermissionApiUserAccount.email,
      user_account_id: multiPermissionApiUserAccount.id,
      secret_key_hash: encryptPassword(multiPermissionApiClientSecret, process.env.API_CLIENT_SALT),
    });

    // Give the test users some permissions

    // Public Demo Land Permission
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: simpleApiUserAccount.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: multiPermissionApiUserAccount.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    // Public Laos permission
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: multiPermissionApiUserAccount.id,
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    // Public all other country permissions
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: multiPermissionApiUserAccount.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
  });

  it('should return user details with apiClient and access policy', async function () {
    const authResponse = await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(simpleApiUserAccount.email, simpleApiClientSecret),
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
    expect(userDetails.apiClient).to.equal(simpleApiUserAccount.email);
    expect(userDetails.accessPolicy).to.deep.equal({ DL: ['Public'], LA: ['Public'] });
  });

  it('should return user details with apiClient and merged access policy', async function () {
    const authResponse = await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(
          multiPermissionApiUserAccount.email,
          multiPermissionApiClientSecret,
        ),
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
    expect(userDetails.apiClient).to.equal(multiPermissionApiUserAccount.email);
    expect(userDetails.accessPolicy).to.deep.equal({
      DL: ['Public'],
      LA: ['Public'],
      KI: ['Public'],
    }); // Merged Access Policy
  });
});
