/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env
import moment from 'moment';

import { randomEmail } from '@tupaia/utils';
import { getAuthorizationHeader, TestableApp } from '../../testUtilities';

describe('One Time Login', () => {
  const app = new TestableApp();
  const { models } = app;
  const { VERIFIED } = models.user.emailVerifiedStatuses;

  const dummyFields = {
    firstName: 'Automated test',
    lastName: 'User',
    password: 'password',
    passwordConfirm: 'password',
    contactNumber: 900000000,
    employer: 'Test',
    position: 'Robot',
    deviceName: 'foobar',
  };

  const headers = { authorization: getAuthorizationHeader() };

  describe('One Time Login tokens', () => {
    it('should only be able to login once with a one time login token', async () => {
      const emailAddress = randomEmail();

      const userResponse = await app.post('user', {
        headers,
        body: {
          emailAddress,
          ...dummyFields,
        },
      });
      const { userId } = userResponse.body;

      await models.user.updateById(userId, { verified_email: VERIFIED });

      const { token } = await models.oneTimeLogin.create({
        user_id: userId,
      });

      const getOneTimeLoginResponse = async () => {
        return app.post('auth?grantType=one_time_login', {
          headers,
          body: {
            token,
            deviceName: 'test_device',
          },
        });
      };

      const authResponse = await getOneTimeLoginResponse();
      const { user } = authResponse.body;
      expect(user.id).toBe(userId);

      const retriedAuthResponse = await getOneTimeLoginResponse();
      // 'Access denied for repeated one time login'
      expect(retriedAuthResponse.status).toBe(500);

      expect(retriedAuthResponse.body).not.toHaveProperty(
        'user',
        'No user object returned by repeated one time login',
      );
    });
  });

  it('should not be able to login using an expired token', async () => {
    const emailAddress = randomEmail();

    const userResponse = await app.post('user', {
      headers,
      body: {
        emailAddress,
        ...dummyFields,
      },
    });
    const { userId } = userResponse.body;

    await models.user.updateById(userId, { verified_email: VERIFIED });

    const { token } = await models.oneTimeLogin.create({
      user_id: userId,
      creation_date: moment().subtract(1, 'h'),
    });

    const loginResponse = await app.post('auth?grantType=one_time_login', {
      headers,
      body: {
        token,
      },
    });
    // Access denied for repeated one time login
    expect(loginResponse.status).toBe(500);
    expect(loginResponse.body).not.toHaveProperty(
      'user',
      'No user object returned by repeated one time login',
    );
  });
});
