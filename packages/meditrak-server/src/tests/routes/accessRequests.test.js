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
    const { id: entityId } = await findOrCreateDummyRecord(models.entity, { code: countryCode });
    const { id: permissionGroupId } = await findOrCreateDummyRecord(models.permissionGroup, {
      name: permissionGroupName,
    });

    return { userId, entityId, permissionGroupId };
  };

  const requestCountryAccess = async (userId, entityId, userGroup) => {
    return app.post(`user/${userId}/requestCountryAccess`, {
      body: {
        entityIds: [entityId],
        message: "E rab'a te kaitiboo! / Pleased to meet you",
        userGroup,
      },
    });
  };

  before(app.authenticate);

  describe('User Entity Permission via Access Request', () => {
    it('creates permission when approved', async () => {
      const { userId, entityId, permissionGroupId } = await createData(
        'test.user@tupaia.org',
        'KI',
        'Admin',
      );

      const response1 = await requestCountryAccess(userId, entityId, 'Admin');
      expect(response1.statusCode).to.equal(200);
      expect(response1.body).to.deep.equal({ message: 'Country access requested.' });

      const { id: accessRequestId } = await models.accessRequest.findOne({
        user_id: userId,
        entity_id: entityId,
      });
      const response2 = await app.put(`accessRequests/${accessRequestId}`, {
        body: { approved: true, approval_note: 'Marurung!' },
      });
      expect(response2.statusCode).to.equal(200);
      expect(response2.body).to.deep.equal({ message: 'Successfully updated accessRequests' });

      await models.database.waitForAllChangeHandlers();

      const permission = await models.userEntityPermission.findOne({
        user_id: userId,
        entity_id: entityId,
        permission_group_id: permissionGroupId,
      });
      expect(permission).to.not.equal(null);
      expect(permission).to.be.an('object');
    });

    it('does not creates permission when rejected', async () => {
      const { userId, entityId, permissionGroupId } = await createData(
        'test.user@tupaia.org',
        'VE',
        'Admin',
      );

      const response1 = await requestCountryAccess(userId, entityId, 'Admin');
      expect(response1.statusCode).to.equal(200);
      expect(response1.body).to.deep.equal({ message: 'Country access requested.' });

      const { id: accessRequestId } = await models.accessRequest.findOne({
        user_id: userId,
        entity_id: entityId,
      });
      const response2 = await app.put(`accessRequests/${accessRequestId}`, {
        body: { approved: false },
      });
      expect(response2.statusCode).to.equal(200);
      expect(response2.body).to.deep.equal({ message: 'Successfully updated accessRequests' });

      await models.database.waitForAllChangeHandlers();

      const permission = await models.userEntityPermission.findOne({
        user_id: userId,
        entity_id: entityId,
        permission_group_id: permissionGroupId,
      });
      expect(permission).to.equal(null);
    });
  });
});
