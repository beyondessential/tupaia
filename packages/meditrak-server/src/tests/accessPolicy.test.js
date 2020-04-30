/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';

import { generateTestId } from '@tupaia/database';
import { TestableApp, getAuthorizationHeader } from './TestableApp';
import { randomEmail, upsertEntity, upsertUserEntityPermission } from './testUtilities';

describe('Access Policy', () => {
  const app = new TestableApp();
  const models = app.models;
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

  describe('Demo Land public user', () => {
    const emailAddress = randomEmail();
    let accessPolicy;
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

      const authResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password: dummyFields.password,
          deviceName: dummyFields.deviceName,
        },
      });

      accessPolicy = authResponse.body.user.accessPolicy;
    });

    it('should only have access to demo land', () => {
      expect(accessPolicy.DL).to.deep.equal(['Public']);
      expect(Object.keys(accessPolicy).length).to.equal(1);
    });

    it('should have only Demo Land UserEntityPermission model in database', async () => {
      const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });
      expect(userEntityPermissions.length).to.equal(1);
      expect(userEntityPermissions[0].entity_code).to.equal('DL');
    });
  });

  describe('Tonga admin user', () => {
    const emailAddress = randomEmail();
    let accessPolicy;
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

      await models.user.updateById(userId, { verified_email: VERIFIED });

      const adminPermissionGroup = await models.permissionGroup.findOne({
        name: 'Admin',
      });

      // if there's a pre-existing Tonga in the DB, use that, otherwise create
      // one with a test ID so it'll get cleaned up later
      const tongaEntity = await models.entity.findOrCreate(
        {
          code: 'TO',
        },
        {
          id: generateTestId(),
          name: 'Tonga',
        },
      );

      await upsertUserEntityPermission({
        user_id: userId,
        entity_id: tongaEntity.id,
        permission_group_id: adminPermissionGroup.id,
      });

      const authResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password: dummyFields.password,
          deviceName: dummyFields.deviceName,
        },
      });

      accessPolicy = authResponse.body.user.accessPolicy;
    });

    it('should have Demo Land public access', () => {
      expect(accessPolicy.DL).to.deep.equal(['Public']);
    });

    it('should have Tonga admin and public access', () => {
      expect(accessPolicy.TO).to.include.members(['Public', 'Admin']);
      expect(Object.values(accessPolicy).length).to.equal(2); // DL and TO only
    });

    it('should have only Demo Land and Tonga UserEntityPermission model in database', async () => {
      const userEntityPermissions = await models.userEntityPermission.find({ user_id: userId });
      expect(userEntityPermissions.length).to.equal(2);

      userEntityPermissions.forEach(userEntityPermission => {
        expect(userEntityPermission.entity_code).to.be.oneOf(['DL', 'TO']);
      });
    });
  });

  describe('Mount Sinai Canada admin user', () => {
    const emailAddress = randomEmail();
    let accessPolicy;
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

      await models.user.updateById(userId, { verified_email: VERIFIED });

      const adminPermissionGroup = await models.permissionGroup.findOne({
        name: 'Admin',
      });

      // Create a facility nested deep within a new country other than Demoland.
      const canada = await upsertEntity({
        code: 'CA',
        name: 'Canada',
        type: 'country',
      });

      const ontario = await upsertEntity({
        name: 'Ontario',
        code: 'CA_OT',
        country_code: canada.code,
        parent_id: canada.id,
        type: 'district',
      });
      const toronto = await upsertEntity({
        name: 'Toronto',
        code: 'CA_OT_TO',
        country_code: canada.code,
        parent_id: ontario.id,
        type: 'district',
      });

      const mountSinai = await upsertEntity({
        code: 'CA_OT_TO_MS',
        name: 'Mount Sinaia Hospital',
        country_code: canada.code,
        parent_id: toronto.id,
        type: 'facility',
      });

      await upsertUserEntityPermission({
        user_id: userId,
        entity_id: mountSinai.id,
        permission_group_id: adminPermissionGroup.id,
      });

      // Create an admin permission for a district not containing Mount Sinai to test
      // for clashes between facility level permissions and org unit level permissions.
      const ottawa = await upsertEntity({
        name: 'Ottawa',
        code: 'CA_OT_OT',
        country_code: canada.code,
        parent_id: ontario.id,
        type: 'district',
      });

      await upsertUserEntityPermission({
        user_id: userId,
        entity_id: ottawa.id,
        permission_group_id: adminPermissionGroup.id,
      });

      const authResponse = await app.post('auth', {
        headers,
        body: {
          emailAddress,
          password: dummyFields.password,
          deviceName: dummyFields.deviceName,
        },
      });

      accessPolicy = authResponse.body.user.accessPolicy;
    });

    it('should have Mount Sinai admin permissions', async () => {
      const mountSinaiPermissions = accessPolicy.CA_OT_TO_MS;
      expect(mountSinaiPermissions).to.include.members(['Admin', 'Donor', 'Public']);
    });

    it('should have Ottawa admin permissions', async () => {
      const ottawaPermissions = accessPolicy.CA_OT_OT;
      expect(ottawaPermissions).to.include.members(['Admin', 'Donor', 'Public']);
    });

    it('should not have Toronto permissions', async () => {
      const torontoPermissions = accessPolicy.CA_OT_TO;
      expect(torontoPermissions).to.be.undefined;
    });

    it('should not have Canada country level permissions', async () => {
      const canadaPermissions = accessPolicy.CA;
      expect(canadaPermissions).to.be.undefined;
    });
  });
});
