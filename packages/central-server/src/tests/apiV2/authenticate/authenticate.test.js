/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { encryptPassword, hashAndSaltPassword, getTokenClaims } from '@tupaia/auth';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';

import { resetTestData, TestableApp } from '../../testUtilities';
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
    await resetTestData();

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

  it('handles incorrect password', async () => {
    const response = await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
      },
      body: {
        emailAddress: userAccount.email,
        password: 'woops',
        deviceName: 'test_device',
      },
    });

    expect(response.body).to.be.an('object').that.has.property('error');
    expect(response.body.error).to.include('Incorrect email or password');
    expect(response.status).to.equal(401);
  });

  it.only('limit consecutive fails by username', async () => {
    const makeRequest = () => {
      return app.post('auth?grantType=password', {
        headers: {
          authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
        },
        body: {
          emailAddress: userAccount.email,
          password: 'woops',
          deviceName: 'test_device',
        },
      });
    };

    const request1 = await makeRequest();
    expect(request1.status).to.equal(401);

    const request2 = await makeRequest();
    expect(request2.status).to.equal(401);

    const request3 = await makeRequest();
    expect(request3.status).to.equal(401);

    const request4 = await makeRequest();
    expect(request4.status).to.equal(401);

    const request5 = await makeRequest();
    expect(request5.status).to.equal(401);

    // 6th request should be rate limited
    const request6 = await makeRequest();
    expect(request6.body).to.be.an('object').that.has.property('error');
    expect(request6.body.error).to.include('Too Many Requests');
    expect(request6.status).to.equal(429);
    expect(request6.headers).to.be.an('object').that.has.property('retry-after');
    expect(request6.headers['retry-after']).to.equal(900);
  });
});
