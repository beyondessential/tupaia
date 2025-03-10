import { constructAccessToken } from '@tupaia/auth';
import { clearTestData, getTestDatabase } from '@tupaia/database';
import { TestableServer } from '@tupaia/server-boilerplate';
import { createBearerHeader } from '@tupaia/utils';
import { grantUserAccess, revokeAccess, setupTestApp, setupTestUser } from '../utilities';
import { CAT_USER } from './fixtures';

const mockResponseMsg = 'Successfully changed password';

describe('me/changePassword', () => {
  let app: TestableServer;
  let authHeader: string;

  beforeAll(async () => {
    app = await setupTestApp({
      central: {
        async changeUserPassword(passwordChangeFields: Record<string, unknown>) {
          const { oldPassword, password, passwordConfirm } = passwordChangeFields;
          if (oldPassword !== CAT_USER.password) {
            throw new Error('Incorrect old password');
          }

          if (password !== passwordConfirm) {
            throw new Error('password != confirm');
          }
          return { message: mockResponseMsg, newPassword: password };
        },
      },
    });

    const user = await setupTestUser();
    authHeader = createBearerHeader(
      constructAccessToken({
        userId: user.id,
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

      expect(response.body).toEqual({ message: mockResponseMsg, newPassword });
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

      expect(response.body).toEqual({ message: mockResponseMsg, newPassword });
    });
  });
});
