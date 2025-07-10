import { expect } from 'chai';
import sinon from 'sinon';

import {
  encryptPassword,
  getTokenClaims,
  sha256EncryptPassword,
  verifyPassword,
} from '@tupaia/auth';
import { findOrCreateDummyCountryEntity, findOrCreateDummyRecord } from '@tupaia/database';
import { createBasicHeader } from '@tupaia/utils';

import { BruteForceRateLimiter } from '../../../apiV2/authenticate/BruteForceRateLimiter';
import { ConsecutiveFailsRateLimiter } from '../../../apiV2/authenticate/ConsecutiveFailsRateLimiter';
import { configureEnv } from '../../../configureEnv';
import { TestableApp, resetTestData } from '../../testUtilities';

configureEnv();
const sandbox = sinon.createSandbox();

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

  afterEach(async () => {
    // completely restore all fakes created through the sandbox
    sandbox.restore();
    const db = models.database;
    const [row] = await db.executeSql(`SELECT current_database();`);
    const { current_database } = row;
    if (current_database !== 'tupaia_test') {
      throw new Error(
        `Safety check failed: clearTestData can only be run against a database named tupaia_test, found ${current_database}.`,
      );
    }
    await db.executeSql(`DELETE FROM login_attempts;`);
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
    const argon2Hash = await encryptPassword(sha256Hash);
    const sha256Hash = sha256EncryptPassword(password, salt);
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

  it("Should migrate user's password to argon2 after successful login", async () => {
    const email = 'squirtle@pokemon.org';
    const password = 'oldPassword123!';
    const salt = 'xyz123^';
    const argon2Hash = await encryptPassword(sha256Hash, salt);
    const sha256Hash = sha256EncryptPassword(password, salt);
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

  it('should add a new entry to the user_country_access_attempts table if one does not already exist', async () => {
    await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
      },
      body: {
        emailAddress: userAccount.email,
        password: userAccountPassword,
        deviceName: 'test_device',
        timezone: 'Pacific/Auckland',
      },
    });
    const entries = await models.userCountryAccessAttempt.find({
      user_id: userAccount.id,
      country_code: 'NZ',
    });
    expect(entries).to.have.length(1);
  });

  it.skip('should not add a new entry to the user_country_access_attempts table if one does already exist', async () => {
    await models.userCountryAccessAttempt.create({
      user_id: userAccount.id,
      country_code: 'WS',
    });
    await app.post('auth?grantType=password', {
      headers: {
        authorization: createBasicHeader(apiClientUserAccount.email, apiClientSecret),
      },
      body: {
        emailAddress: userAccount.email,
        password: userAccountPassword,
        deviceName: 'test_device',
        timezone: 'Pacific/Apia',
      },
    });
    const entries = await models.userCountryAccessAttempt.find({
      user_id: userAccount.id,
      country_code: 'WS',
    });
    expect(entries).to.have.length(1);
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
    sandbox.stub(ConsecutiveFailsRateLimiter.prototype, 'getMaxAttempts').returns(times);

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
  });

  it('limit fails by ip address ', async () => {
    const times = 3;
    sandbox.stub(BruteForceRateLimiter.prototype, 'getMaxAttempts').returns(times);

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
  });

  it('limit refresh token fails ', async () => {
    const times = 3;
    sandbox.stub(BruteForceRateLimiter.prototype, 'getMaxAttempts').returns(times);
    // Make sure that it doesn't rate limit based on email address
    sandbox.stub(ConsecutiveFailsRateLimiter.prototype, 'getMaxAttempts').returns(times - 1);

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
  });

  it('limit one time login fails ', async () => {
    const times = 3;
    sandbox.stub(BruteForceRateLimiter.prototype, 'getMaxAttempts').returns(times);

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
  });
});
