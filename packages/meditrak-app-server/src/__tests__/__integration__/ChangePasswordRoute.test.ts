/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { constructAccessToken } from '@tupaia/auth';
import { MockCentralApi } from '@tupaia/api-client';
import { clearTestData, getTestDatabase } from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBearerHeader } from '@tupaia/utils';
import { grantUserAccess, revokeAccess, setupTestApp, setupTestUser } from '../utilities';
import { CAT_USER, CAT_USER_SESSION } from './fixtures';

const mockResponseMsg = 'Successfully changed password';

describe('me/changePassword', () => {
  let app: TestableServer;
  let authHeader: string;

  beforeAll(async () => {
    app = await setupTestApp({
      central: new MockCentralApi({ user: CAT_USER }),
    });

    const user = await setupTestUser();
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
        refreshToken: CAT_USER_SESSION.refreshToken,
        apiClientUserId: undefined,
      }),
    );
    grantUserAccess(user.id);
  });

  afterAll(async () => {
    revokeAccess();
    await clearTestData(getTestDatabase());
  });

  describe('/me/changePassword (change user password)', () => {
    it('throws an error if no auth header is provided', async () => {
      const newPassword = 'pass';
      const response = await app.post('me/changePassword', {
        body: {
          oldPassword: CAT_USER.password,
          password: newPassword,
          passwordConfirm: newPassword,
        },
      });

      expect(response.statusCode).toBe(500);
      expect(response.body.error).toMatch(/.*Authorization header required/);
    });

    it('it invokes changeUserPassword() on the CentralApi', async () => {
      const newPassword = 'pass';
      const response = await app.post('me/changePassword', {
        headers: {
          Authorization: authHeader,
        },
        body: {
          oldPassword: CAT_USER.password,
          password: newPassword,
          passwordConfirm: newPassword,
        },
      });

      expect(response.body).toEqual({ message: mockResponseMsg });
    });

    it('it supports older meditrak-app password params', async () => {
      const newPassword = 'pass';
      const response = await app.post('me/changePassword', {
        headers: {
          Authorization: authHeader,
        },
        body: {
          oldPassword: CAT_USER.password,
          newPassword,
          newPasswordConfirm: newPassword,
        },
      });

      expect(response.body).toEqual({ message: mockResponseMsg });
    });
  });
});
