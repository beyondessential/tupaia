/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env

import { createBearerHeader, randomEmail, randomString } from '@tupaia/utils';

import { getAuthorizationHeader, TestableApp } from '../testUtilities';

describe('Reset Password', () => {
  const app = new TestableApp();
  const { models } = app;
  const { VERIFIED } = models.user.emailVerifiedStatuses;

  const emailAddress = randomEmail();

  const dummyFields = {
    firstName: 'Automated test',
    lastName: 'User',
    password: 'password123',
    passwordConfirm: 'password123',
    contactNumber: 900000000,
    employer: 'Test',
    position: 'Robot',
    deviceName: 'foobar',
  };

  const headers = { authorization: getAuthorizationHeader() };

  describe('Reset password using One Time Login', () => {
    it('should be able to reset a password, end-to-end using one-time login from email', async () => {
      const userResponse = await app.post('user', {
        headers,
        body: {
          emailAddress,
          ...dummyFields,
        },
      });
      const { userId } = userResponse.body;
      expect(userId).toBeDefined();

      await models.user.updateById(userId, { verified_email: VERIFIED });

      const result = await app.post('auth/resetPassword', {
        headers,
        body: {
          emailAddress,
        },
      });
      const { success } = result.body;
      expect(success).toBe(true);

      const oneTimeLogin = await models.oneTimeLogin.findOne({
        user_id: userId,
      });

      expect(oneTimeLogin.isExpired()).toBe(false);
      expect(oneTimeLogin.isUsed()).toBe(false);

      const getOneTimeLoginResponse = async () =>
        app.post('auth?grantType=one_time_login', {
          headers,
          body: {
            token: oneTimeLogin.token,
            deviceName: 'test_device',
          },
        });

      const authResponse = await getOneTimeLoginResponse();

      const { user, accessToken } = authResponse.body;
      expect(user.id).toBe(userId);

      const refetchedOneTimeLogin = await models.oneTimeLogin.findById(oneTimeLogin.id);
      expect(refetchedOneTimeLogin.isExpired()).toBe(false);
      expect(refetchedOneTimeLogin.isUsed()).toBe(true);

      const retriedAuthResponse = await getOneTimeLoginResponse();
      expect(retriedAuthResponse.status).toBe(500);

      expect(retriedAuthResponse.body).not.toHaveProperty(
        'user',
        'No user object returned by repeated one time login',
      );

      const password = randomString();
      const changePassword = await app.post('me/changePassword', {
        headers: {
          Authorization: createBearerHeader(accessToken),
        },
        body: {
          oneTimeLoginToken: oneTimeLogin.token,
          password,
          passwordConfirm: password,
        },
      });

      expect(changePassword.status).toBe(200);

      const passwordAuthResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password,
          deviceName: 'test',
        },
      });

      expect(passwordAuthResponse.status).toBe(200);
    });
  });
});
