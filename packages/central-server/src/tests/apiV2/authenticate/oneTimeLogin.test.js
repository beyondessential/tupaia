import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import moment from 'moment';

import { randomEmail } from '@tupaia/utils';
import { getAuthorizationHeader, TestableApp } from '../../testUtilities';
import { configureEnv } from '../../../configureEnv';

configureEnv();

describe('One Time Login', function () {
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

  describe('One Time Login tokens', function () {
    it('should only be able to login once with a one time login token', async function () {
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
      expect(user.id).to.equal(userId, 'Successfuly logged in with one time login');

      const retriedAuthResponse = await getOneTimeLoginResponse();
      expect(retriedAuthResponse.status, 403, 'Access denied for repeated one time login');

      expect(retriedAuthResponse.body).to.not.have.property(
        'user',
        'No user object returned by repeated one time login',
      );
    });
  });

  it('should not be able to login using an expired token', async function () {
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
    expect(loginResponse.status, 403, 'Access denied for repeated one time login');
    expect(loginResponse.body).to.not.have.property(
      'user',
      'No user object returned by repeated one time login',
    );
  });
});
