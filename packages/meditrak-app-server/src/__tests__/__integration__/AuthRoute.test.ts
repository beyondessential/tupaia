/**
 * Tupaia
 * Copyright (c) 2017 - 2022 Beyond Essential Systems Pty Ltd
 */

import { TestableServer } from '@tupaia/server-boilerplate';
import { MockAuthApi } from '@tupaia/api-client';
import { getTestModels, upsertDummyRecord } from '@tupaia/database';
import { setupTestApp } from '../utilities';
import { CAT_USER, CAT_USER_SESSION, SESSIONS, USERS } from './fixtures';
import { TestModelRegistry } from '../types';

describe('auth', () => {
  let app: TestableServer;

  beforeAll(async () => {
    const models = getTestModels() as TestModelRegistry;
    await Promise.all(USERS.map(user => upsertDummyRecord(models.user, user)));

    app = await setupTestApp({
      auth: new MockAuthApi(USERS, SESSIONS),
    });
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

      expect(response.body).toEqual({
        accessPolicy: CAT_USER.accessPolicy,
        email: CAT_USER.email,
        accessToken: CAT_USER_SESSION.accessToken,
        refreshToken: CAT_USER_SESSION.refreshToken,
        user: {
          id: CAT_USER.id,
          accessPolicy: CAT_USER.accessPolicy,
          email: CAT_USER.email,
        },
      });
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
        body: { refreshToken: CAT_USER_SESSION.refreshToken },
        query: { grantType: 'refresh_token' },
      });

      expect(response.body).toEqual({
        accessPolicy: CAT_USER.accessPolicy,
        email: CAT_USER.email,
        accessToken: CAT_USER_SESSION.accessToken,
        refreshToken: CAT_USER_SESSION.refreshToken,
        user: {
          id: CAT_USER.id,
          accessPolicy: CAT_USER.accessPolicy,
          email: CAT_USER.email,
        },
      });
    });
  });
});
