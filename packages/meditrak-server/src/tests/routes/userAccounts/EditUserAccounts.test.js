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

describe('Permissions checker for EditUserAccounts', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let userAccount1;
  let userAccount2;

  before(async () => {
    const permissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
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
      first_name: 'Barry',
      last_name: 'Allen',
    });
    userAccount2 = await findOrCreateDummyRecord(models.user, {
      first_name: 'Hal',
      last_name: 'Jordan',
    });

    // Give the test users some permissions
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount1.id,
      entity_id: demoEntity.id,
      permission_group_id: permissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount1.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: permissionGroup.id,
    });

    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount2.id,
      entity_id: demoEntity.id,
      permission_group_id: permissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount2.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: permissionGroup.id,
    });
    await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount2.id,
      entity_id: laosEntity.id,
      permission_group_id: permissionGroup.id,
    });
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('PUT /users/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw a permissions gate error if current user does not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await prepareStubAndAuthenticate(app, policy);
        const { body: result } = await app.put(`users/${userAccount1.id}`, {
          body: { email: 'barry.allen@ccpd.gov' },
        });

        expect(result).to.have.keys('error');
      });
      it('Throw an exception when trying to edit a user account the current user lacks permissions for', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        const { body: result } = await app.put(`users/${userAccount2.id}`, {
          body: { email: 'hal.jordan@lantern.corp' },
        });

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permissions', async () => {
      it('Edit a user account the current user has permissions for', async () => {
        await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
        await app.put(`users/${userAccount1.id}`, {
          body: { email: 'barry.allen@ccpd.gov' },
        });
        const result = await models.user.findById(userAccount1.id);

        expect(result.email).to.deep.equal('barry.allen@ccpd.gov');
      });
      it('Edit any user account as BES Admin', async () => {
        await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
        await app.put(`users/${userAccount2.id}`, {
          body: { email: 'hal.jordan@lantern.corp' },
        });
        const result = await models.user.findById(userAccount2.id);

        expect(result.email).to.deep.equal('hal.jordan@lantern.corp');
      });
    });
  });
});
