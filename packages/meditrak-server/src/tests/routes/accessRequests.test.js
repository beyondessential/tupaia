/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { generateTestId } from '@tupaia/database';
import { TestableApp } from '../TestableApp';

describe.only('Access Requests', () => {
  const app = new TestableApp();
  const models = app.models;
  models.database.generateId = generateTestId;

  const requestCountryAccess = async (userId, countryId) => {
    return app.post(`user/${userId}/requestCountryAccess`, {
      body: {
        countryIds: [countryId],
        message: "E rab'a te kaitiboo! / Pleased to meet you",
        userGroup: 'Admin',
      },
    });
  };

  before(app.authenticate);

  describe('User Country Permission via Access Request', () => {
    it('creates permission when approved', async () => {
      const { id: userId } = await models.user.findOne({ email: 'test.user@tupaia.org' });
      const { id: countryId } = await models.country.findOne({ code: 'KI' });

      const response1 = await requestCountryAccess(userId, countryId);
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
      });
      expect(permission).to.not.equal(null);
      expect(permission).to.be.an('object');
    });

    it('does not creates permission when rejected', async () => {
      const { id: userId } = await models.user.findOne({ email: 'test.user@tupaia.org' });
      const { id: countryId } = await models.country.findOne({ code: 'VE' });

      const response1 = await requestCountryAccess(userId, countryId);
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
      });
      expect(permission).to.equal(null);
    });
  });
});
