/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { TestableApp } from '../TestableApp';

describe('Access Requests', () => {
  const app = new TestableApp();
  const models = app.models;

  const createData = async (email, countryCode, permissionGroupName) => {
    const { id: userId } = await findOrCreateDummyRecord(models.user, { email });
    const { id: countryId } = await findOrCreateDummyRecord(models.country, { code: countryCode });
    const { id: permissionGroupId } = await findOrCreateDummyRecord(models.permissionGroup, {
      name: permissionGroupName,
    });

    return { userId, countryId, permissionGroupId };
  };

  const requestCountryAccess = async (userId, countryId, userGroup) => {
    return app.post(`user/${userId}/requestCountryAccess`, {
      body: {
        countryIds: [countryId],
        message: "E rab'a te kaitiboo! / Pleased to meet you",
        userGroup,
      },
    });
  };

  before(app.authenticate);

  describe('User Country Permission via Access Request', () => {
    it('creates permission when approved', async () => {
      const { userId, countryId, permissionGroupId } = await createData(
        'test.user@tupaia.org',
        'KI',
        'Admin',
      );

      const response1 = await requestCountryAccess(userId, countryId, 'Admin');
      expect(response1.statusCode).to.equal(200);
      expect(response1.body).to.deep.equal({ message: 'Country access requested.' });

      const { id: accessRequestId } = await models.accessRequest.findOne({
        user_id: userId,
        country_id: countryId,
      });
      const response2 = await app.put(`accessRequests/${accessRequestId}`, {
        body: { approved: true, approval_note: 'Marurung!' },
      });
      expect(response2.statusCode).to.equal(200);
      expect(response2.body).to.deep.equal({ message: 'Successfully updated accessRequests' });

      await models.database.waitForAllChangeHandlers();

      const permission = await models.userCountryPermission.findOne({
        user_id: userId,
        country_id: countryId,
        permission_group_id: permissionGroupId,
      });
      expect(permission).to.not.equal(null);
      expect(permission).to.be.an('object');
    });

    it('does not creates permission when rejected', async () => {
      const { userId, countryId, permissionGroupId } = await createData(
        'test.user@tupaia.org',
        'VE',
        'Admin',
      );

      const response1 = await requestCountryAccess(userId, countryId, 'Admin');
      expect(response1.statusCode).to.equal(200);
      expect(response1.body).to.deep.equal({ message: 'Country access requested.' });

      const { id: accessRequestId } = await models.accessRequest.findOne({
        user_id: userId,
        country_id: countryId,
      });
      const response2 = await app.put(`accessRequests/${accessRequestId}`, {
        body: { approved: false },
      });
      expect(response2.statusCode).to.equal(200);
      expect(response2.body).to.deep.equal({ message: 'Successfully updated accessRequests' });

      await models.database.waitForAllChangeHandlers();

      const permission = await models.userCountryPermission.findOne({
        user_id: userId,
        country_id: countryId,
        permission_group_id: permissionGroupId,
      });
      expect(permission).to.equal(null);
    });
  });
});
