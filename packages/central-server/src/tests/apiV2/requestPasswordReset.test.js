import { expect } from 'chai';

import { createBearerHeader, randomEmail, randomString } from '@tupaia/utils';

import { getAuthorizationHeader, TestableApp } from '../testUtilities';
import { configureEnv } from '../../configureEnv';

configureEnv();

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
      expect(userId).to.exist;

      await models.user.updateById(userId, { verified_email: VERIFIED });

      const result = await app.post('auth/resetPassword', {
        headers,
        body: {
          emailAddress,
        },
      });
      const { success } = result.body;
      expect(success).to.equal(true);

      const oneTimeLogin = await models.oneTimeLogin.findOne({
        user_id: userId,
      });

      expect(oneTimeLogin.isExpired).to.equal(false, 'One time login not expired');
      expect(oneTimeLogin.isUsed).to.equal(false, 'One time login not used');

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
      expect(user.id).to.equal(userId, 'Successfuly logged in with one time login');

      const refetchedOneTimeLogin = await models.oneTimeLogin.findById(oneTimeLogin.id);
      expect(refetchedOneTimeLogin.isExpired).to.equal(false);
      expect(refetchedOneTimeLogin.isUsed).to.equal(true);

      const retriedAuthResponse = await getOneTimeLoginResponse();
      expect(retriedAuthResponse.status, 403, 'Access denied for repeated one time login');

      expect(retriedAuthResponse.body).to.not.have.property(
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

      expect(changePassword.status).to.equal(200, 'Change password completed');

      const passwordAuthResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password,
          deviceName: 'test',
        },
      });

      expect(passwordAuthResponse.status).to.equal(200);
    });
  });
});
