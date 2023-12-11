/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { findOrCreateDummyRecord } from '@tupaia/database';
import { TEST_USER_EMAIL, TestableApp } from '../testUtilities';

describe('Access Requests', () => {
  const app = new TestableApp();
  const { models } = app;

  const createData = async (email, countryCode, projectCode, permissionGroupName) => {
    const { id: userId } = await findOrCreateDummyRecord(models.user, { email });
    const { id: entityId } = await findOrCreateDummyRecord(models.entity, { code: countryCode });
    const { id: permissionGroupId } = await findOrCreateDummyRecord(models.permissionGroup, {
      name: permissionGroupName,
    });
    await findOrCreateDummyRecord(
      models.project,
      { code: projectCode },
      { permission_groups: [permissionGroupName] },
    );

    return { userId, entityId, permissionGroupId };
  };

  const requestCountryAccess = async (userId, entityId, projectCode) => {
    return app.post(`user/${userId}/requestCountryAccess`, {
      body: {
        entityIds: [entityId],
        message: "E rab'a te kaitiboo! / Pleased to meet you",
        projectCode,
      },
    });
  };

  beforeAll(async () => {
    await app.grantFullAccess(); // We're not testing permissions here
  });

  afterAll(() => {
    app.revokeAccess();
  });

  describe('User Entity Permission via Access Request', () => {
    it('creates permission when approved', async () => {
      const { userId, entityId, permissionGroupId } = await createData(
        TEST_USER_EMAIL,
        'KI',
        'unfpa',
        'UNFPA',
      );

      const response1 = await requestCountryAccess(userId, entityId, 'unfpa');
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toStrictEqual({ message: 'Country access requested.' });

      const { id: accessRequestId } = await models.accessRequest.findOne({
        user_id: userId,
        entity_id: entityId,
      });
      const response2 = await app.put(`accessRequests/${accessRequestId}`, {
        body: { approved: true, approval_note: 'Marurung!' },
      });
      expect(response2.statusCode).toBe(200);
      expect(response2.body).toStrictEqual({ message: 'Successfully updated accessRequests' });

      await models.database.waitForAllChangeHandlers();

      const permission = await models.userEntityPermission.findOne({
        user_id: userId,
        entity_id: entityId,
        permission_group_id: permissionGroupId,
      });
      expect(permission).not.toBe(null);
      expect(permission).toBeInstanceOf(Object);
    });

    it('does not create permission when rejected', async () => {
      const { userId, entityId, permissionGroupId } = await createData(
        TEST_USER_EMAIL,
        'VE',
        'unfpa',
        'UNFPA',
      );

      const response1 = await requestCountryAccess(userId, entityId, 'unfpa');
      expect(response1.statusCode).toBe(200);
      expect(response1.body).toStrictEqual({ message: 'Country access requested.' });

      const { id: accessRequestId } = await models.accessRequest.findOne({
        user_id: userId,
        entity_id: entityId,
      });
      const response2 = await app.put(`accessRequests/${accessRequestId}`, {
        body: { approved: false },
      });
      expect(response2.statusCode).toBe(200);
      expect(response2.body).toStrictEqual({ message: 'Successfully updated accessRequests' });

      await models.database.waitForAllChangeHandlers();

      const permission = await models.userEntityPermission.findOne({
        user_id: userId,
        entity_id: entityId,
        permission_group_id: permissionGroupId,
      });
      expect(permission).toBe(null);
    });
  });
});
