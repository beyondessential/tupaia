/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import sinon from 'sinon';
import { encryptPassword, hashAndSaltPassword, getTokenClaims } from '@tupaia/auth';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';
import { resetTestData, TestableApp } from '../../testUtilities';
import { configureEnv } from '../../../configureEnv';
import { ConsecutiveFailsRateLimiter } from '../../../apiV2/authenticate/ConsecutiveFailsRateLimiter';
import { BruteForceRateLimiter } from '../../../apiV2/authenticate/BruteForceRateLimiter';

configureEnv();

const app = new TestableApp();
const { models } = app;
const { VERIFIED } = models.user.emailVerifiedStatuses;

const userAccountPassword = 'password';
const apiClientSecret = 'api';

let userAccount;
let apiClientUserAccount;

function expectRateLimitError(request) {
  expect(request.body).to.be.an('object').that.has.property('error');
  expect(request.body.error).to.include('Too Many Requests');
  expect(request.status).to.equal(429);
  expect(request.headers).to.be.an('object').that.has.property('retry-after');
}

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

  it('limit consecutive fails by username', async () => {
    const times = 4;
    const stub = sinon.stub(ConsecutiveFailsRateLimiter.prototype, 'getMaxAttempts').returns(times);

    const makeRequest = () => {
      return app.post('auth?grantType=password', {
        headers: {
          authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
        },
        body: {
          emailAddress: 'test@bes.au',
          password: 'woops',
          deviceName: 'test_device',
        },
      });
    };

    for (let i = 0; i <= times; i++) {
      const request = await makeRequest();

      if (i < times) {
        expect(request.status).to.equal(401);
      } else {
        // request should be rate limited
        expectRateLimitError(request);
        expect(request.headers['retry-after']).to.equal('900');
      }
    }

    stub.restore();
  });

  it('limit fails by ip address ', async () => {
    const times = 3;
    const stub = sinon.stub(BruteForceRateLimiter.prototype, 'getMaxAttempts').returns(times);

    const makeRequest = emailAddress => {
      return app.post('auth?grantType=password', {
        headers: {
          authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
        },
        body: {
          emailAddress,
          password: 'woops',
          deviceName: 'test_device',
        },
      });
    };

    for (let i = 0; i <= times; i++) {
      const request = await makeRequest(`${i}${userAccount.email}`);

      if (i < times) {
        expect(request.status).to.equal(401);
      } else {
        // request should be rate limited
        expectRateLimitError(request);
        expect(request.headers['retry-after']).to.equal('86400');
      }
    }

    stub.restore();
  });

  it('limit refresh token fails ', async () => {
    const times = 3;
    const stub = sinon.stub(BruteForceRateLimiter.prototype, 'getMaxAttempts').returns(times);
    // Make sure that it doesn't rate limit based on email address
    const stub2 = sinon
      .stub(ConsecutiveFailsRateLimiter.prototype, 'getMaxAttempts')
      .returns(times - 1);

    const makeRequest = () => {
      return app.post('auth?grantType=refresh_token', {
        headers: {
          authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
        },
        body: {
          refreshToken: 'abc123',
        },
      });
    };

    for (let i = 0; i <= times; i++) {
      const request = await makeRequest();

      if (i < times) {
        expect(request.status).to.equal(401);
      } else {
        // request should be rate limited
        expectRateLimitError(request);
        expect(request.headers['retry-after']).to.equal('86400');
      }
    }

    stub.restore();
    stub2.restore();
  });

  it('limit one time login fails ', async () => {
    const times = 3;
    const stub = sinon.stub(BruteForceRateLimiter.prototype, 'getMaxAttempts').returns(times);

    const makeRequest = () => {
      return app.post('auth?grantType=one_time_login', {
        headers: {
          authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
        },
        body: {
          token: 'abc123',
        },
      });
    };

    for (let i = 0; i <= times; i++) {
      const request = await makeRequest();

      if (i < times) {
        expect(request.status).to.equal(401);
      } else {
        // request should be rate limited
        expectRateLimitError(request);
        expect(request.headers['retry-after']).to.equal('86400');
      }
    }

    stub.restore();
  });
});
