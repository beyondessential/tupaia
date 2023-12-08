/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { randomEmail } from '@tupaia/utils';
import { getAuthorizationHeader, TestableApp } from '../testUtilities';

describe('/user', () => {
  const app = new TestableApp();
  const { models } = app;
  const { VERIFIED } = models.user.emailVerifiedStatuses;

  const dummyFields = {
    firstName: 'Automated test',
    lastName: 'User',
    password: 'password',
    passwordConfirm: 'password',
    contactNumber: '900000000',
    employer: 'Test',
    position: 'Robot',
    deviceName: 'foobar',
  };

  const headers = { authorization: getAuthorizationHeader() };

  describe('POST', () => {
    const emailAddress = randomEmail();
    let userId;

    before(async () => {
      const userResponse = await app.post('user', {
        headers,
        body: {
          emailAddress,
          ...dummyFields,
        },
      });
      userId = userResponse.body.userId;

      await models.user.updateById(userId, {
        verified_email: VERIFIED,
      });
    });

    it('should have created the user', async () => {
      const user = await models.user.findById(userId);
      expect(user).to.exist;
      return expect(user.getData()).to.eventually.include({
        first_name: dummyFields.firstName,
        last_name: dummyFields.lastName,
        employer: dummyFields.employer,
        position: dummyFields.position,
        mobile_number: dummyFields.contactNumber,
        email: emailAddress,
      });
    });

    it('should have only Demo Land UserEntityPermission model in database', async () => {
      const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });
      expect(userEntityPermissions.length).to.equal(1);
      expect(userEntityPermissions[0].entity_code).to.equal('DL');
    });
  });
});
