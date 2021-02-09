/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../TestableApp';
import { prepareStubAndAuthenticate } from '../utilities/prepareStubAndAuthenticate';

describe('Permissions checker for GETUserAccounts', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let userAccount1;
  let userAccount2;
  let userAccount3;
  let userAccountIds;
  let filterString;

  before(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });

    const { entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
    });

    const { entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
    });

    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });

    const { entity: demoEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'DL',
    });

    // Create test users
    userAccount1 = await findOrCreateDummyRecord(models.user, {
      first_name: 'Clark',
      last_name: 'Kent',
    });
    userAccount2 = await findOrCreateDummyRecord(models.user, {
      first_name: 'Bruce',
      last_name: 'Wayne',
    });
    userAccount3 = await findOrCreateDummyRecord(models.user, {
      first_name: 'Diana',
      last_name: 'Prince',
    });

    // Give the test users some permissions
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount1.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount1.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount2.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount2.id,
      entity_id: vanuatuEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount3.id,
      entity_id: demoEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount3.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount3.id,
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    // Create a filter string so we are only requesting the test data from the endpoint
    userAccountIds = [userAccount1.id, userAccount2.id, userAccount3.id];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${userAccountIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /users/:id', async () => {
    it('Sufficient permissions: Return a requested user account if we have access to all the countries the user has access to', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`users/${userAccount2.id}`);

      expect(result.id).to.equal(userAccount2.id);
    });

    it('Sufficient permissions: Return a requested user account if we have BES admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: result } = await app.get(`users/${userAccount2.id}`);

      expect(result.id).to.equal(userAccount2.id);
    });

    it('Insufficient permissions: Throw an exception if we do not have access to same countries as the user', async () => {
      const policy = {
        DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`users/${userAccount2.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /users', async () => {
    it('Sufficient permissions: Return only the list of user accounts we have permissions for', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`users?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([userAccount1.id, userAccount2.id]);
    });

    it('Sufficient permissions: Return the full list of user accounts if we have BES Admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`users?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(userAccountIds);
    });

    it('Insufficient permissions: Throws a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`users?${filterString}`);

      expect(results).have.keys('error');
    });

    it('Insufficient permissions: Return an empty array if we have permissions to no user accounts', async () => {
      const policy = {
        DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`users?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
