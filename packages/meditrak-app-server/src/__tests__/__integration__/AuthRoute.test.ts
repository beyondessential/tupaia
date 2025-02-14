import { TestableServer } from '@tupaia/server-boilerplate';
import { AuthApiMock, setupTestApp } from '../utilities';
import { CAT_USER, CAT_USER_SESSION, TEST_DATA } from './fixtures';

describe('auth', () => {
  let app: TestableServer;

  beforeAll(async () => {
    app = await setupTestApp({ auth: new AuthApiMock(TEST_DATA) });
  });

  describe('/auth (login)', () => {
    it('returns an error if any of the expected fields are missing', async () => {
      const response = await app.post('auth', {
        body: {
          password: 'password',
          deviceName: 'test',
          devicePlatform: 'android',
          installId: '1234',
        },
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toMatch(
        /Internal server error: emailAddress is a required field/,
      );
    });

    it('can login a user', async () => {
      const response = await app.post('auth', {
        body: {
          emailAddress: CAT_USER.email,
          password: CAT_USER.password,
          deviceName: 'test',
          devicePlatform: 'android',
          installId: '1234',
        },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(CAT_USER);
    });
  });

  describe('/auth?grantType=refresh_token (re-authenticate)', () => {
    it('returns 500 if no refreshToken provided', async () => {
      const response = await app.post('auth', {
        body: {},
        query: { grantType: 'refresh_token' },
      });

      expect(response.statusCode).toEqual(500);
      expect(response.body.error).toEqual(
        'Internal server error: refreshToken is a required field',
      );
    });

    it('can re-authenticate a user', async () => {
      const response = await app.post('auth', {
        body: { refreshToken: CAT_USER_SESSION.refresh_token },
        query: { grantType: 'refresh_token' },
      });

      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual(CAT_USER);
    });
  });
});
