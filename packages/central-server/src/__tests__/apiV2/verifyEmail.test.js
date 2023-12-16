/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env

import { encryptPassword } from '@tupaia/auth';
import { randomEmail } from '@tupaia/utils';
import { getAuthorizationHeader, TestableApp } from '../testUtilities';

describe('Verify Email', () => {
  const app = new TestableApp();
  const { models } = app;
  const { VERIFIED, NEW_USER, UNVERIFIED } = models.user.emailVerifiedStatuses;

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

  const createUser = async emailAddress => {
    const userResponse = await app.post('user', {
      headers,
      body: {
        emailAddress,
        ...dummyFields,
      },
    });

    const { userId } = userResponse.body;
    return userId;
  };

  const verifyEmail = async userId => {
    const user = await models.user.findById(userId);
    const token = encryptPassword(user.email + user.password_hash, user.password_salt);

    return app.post('auth/verifyEmail', {
      headers,
      body: {
        token,
      },
    });
  };

  const login = async emailAddress => {
    const body = {
      emailAddress,
      password: dummyFields.password,
      deviceName: 'Test Device',
    };
    return app.post('auth', { headers, body });
  };

  describe('Create Login and test email verification', () => {
    it('Should not be able to login without first verifying email ', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);

      const response = await login(emailAddress);
      expect(response.status).toBe(403);

      const user = await models.user.findById(userId);
      expect(user).toHaveProperty('verified_email', NEW_USER);
    });

    it('Should be able to verify email correctly', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);

      const response = await verifyEmail(userId);
      expect(response.status).toBe(200);

      const user = await models.user.findById(userId);
      expect(user).toHaveProperty('verified_email', VERIFIED);
    });

    it('Should be able to login after verifying email', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);
      await verifyEmail(userId);

      const response = await login(emailAddress);
      expect(response.status).toBe(200);

      const user = await models.user.findById(userId);
      expect(user).toHaveProperty('verified_email', VERIFIED);
    });

    it('Existing users should be able to login with unverified status ', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);

      await models.user.updateById(userId, { verified_email: UNVERIFIED });
      const user = await models.user.findById(userId);
      expect(user).toHaveProperty('verified_email', UNVERIFIED);

      const response = await login(emailAddress);
      expect(response.status).toBe(200);
    });
  });
});
