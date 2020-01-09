/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import {} from 'dotenv/config'; // Load the environment variables into process.env
import { expect } from 'chai';

import { TestableApp, getAuthorizationHeader } from './TestableApp';
import { randomEmail, EMAIL_VERIFIED_STATUS } from './testUtilities';
import { encryptPassword } from '../utilities';

describe('Verify Email', () => {
  const app = new TestableApp();
  const models = app.models;

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
      emailAddress: emailAddress,
      password: dummyFields.password,
      deviceName: 'Test Device',
    };
    return app.post('auth', { headers, body });
  };

  const verifyUserStatus = async (userId, status) => {
    const user = await models.user.findById(userId);
    return user.verified_email === status;
  };

  describe('Create Login and test email verification', () => {
    it('Should not be able to login without first verifying email ', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);

      const response = await login(emailAddress);
      expect(response.status).to.equal(403);

      const userStatus = await verifyUserStatus(userId, EMAIL_VERIFIED_STATUS.NEW_USER);
      expect(userStatus).to.equal(true);
    });

    it('Should be able to verify email correctly', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);

      const response = await verifyEmail(userId);
      expect(response.status).to.equal(200);

      const userStatus = await verifyUserStatus(userId, EMAIL_VERIFIED_STATUS.VERIFIED);
      expect(userStatus).to.equal(true);
    });

    it('Should be able to login after verifying email', async () => {
      const emailAddress = randomEmail();
      const userId = await createUser(emailAddress);
      await verifyEmail(userId);

      const response = await login(emailAddress);
      expect(response.status).to.equal(200);

      const userStatus = await verifyUserStatus(userId, EMAIL_VERIFIED_STATUS.VERIFIED);
      expect(userStatus).to.equal(true);
    });
  });
});
