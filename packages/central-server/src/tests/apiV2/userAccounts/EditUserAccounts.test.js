import { expect } from 'chai';

import {
  findOrCreateDummyCountryEntity,
  findOrCreateDummyRecord,
  generateId,
} from '@tupaia/database';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for EditUserAccounts', async () => {
  const DEFAULT_POLICY = /** @type {const} */ ({
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    LA: ['Admin', 'Public'],
    TO: ['Admin', 'Public'],
  });

  const BES_ADMIN_POLICY = /** @type {const} */ ({
    SB: [BES_ADMIN_PERMISSION_GROUP],
  });

  const app = new TestableApp();
  const { models } = app;
  let userAccount1;
  let userAccount2;

  before(async () => {
    [userAccount1, userAccount2] = await Promise.all([
      findOrCreateDummyRecord(models.user, { first_name: 'Barry', last_name: 'EditUserAccounts' }),
      findOrCreateDummyRecord(models.user, { first_name: 'Hal', last_name: 'EditUserAccounts' }),
    ]);

    const [
      publicPermissionGroup,
      { entity: kiribatiEntity },
      { entity: laosEntity },
      { entity: demoEntity },
    ] = await Promise.all([
      findOrCreateDummyRecord(models.permissionGroup, { name: 'Public' }),
      findOrCreateDummyCountryEntity(models, { code: 'KI' }),
      findOrCreateDummyCountryEntity(models, { code: 'LA' }),
      findOrCreateDummyCountryEntity(models, { code: 'DL' }),
    ]);

    // Give the test users some permissions
    await Promise.all([
      findOrCreateDummyRecord(models.userEntityPermission, {
        user_id: userAccount1.id,
        entity_id: demoEntity.id,
        permission_group_id: publicPermissionGroup.id,
      }),
      findOrCreateDummyRecord(models.userEntityPermission, {
        user_id: userAccount1.id,
        entity_id: kiribatiEntity.id,
        permission_group_id: publicPermissionGroup.id,
      }),
      findOrCreateDummyRecord(models.userEntityPermission, {
        user_id: userAccount2.id,
        entity_id: demoEntity.id,
        permission_group_id: publicPermissionGroup.id,
      }),
      findOrCreateDummyRecord(models.userEntityPermission, {
        user_id: userAccount2.id,
        entity_id: kiribatiEntity.id,
        permission_group_id: publicPermissionGroup.id,
      }),
      findOrCreateDummyRecord(models.userEntityPermission, {
        user_id: userAccount2.id,
        entity_id: laosEntity.id,
        permission_group_id: publicPermissionGroup.id,
      }),
    ]);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /users/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await app.grantAccess(policy);
        const { body: result } = await app.put(`users/${userAccount1.id}`, {
          body: { email: 'barry.allen@ccpd.gov' },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception if we do not have admin panel access to all the countries the user we are editing has access to', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(`users/${userAccount2.id}`, {
          body: { email: 'hal.jordan@lantern.corp' },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception if we do not have equal or greater access to all the countries the user we are editing has access to', async () => {
        await app.grantAccess({ ...DEFAULT_POLICY, KI: ['Donor'] });
        const { body: result } = await app.put(`users/${userAccount2.id}`, {
          body: { email: 'barry.allen@ccpd.gov' },
        });

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permissions', async () => {
      it('Allow editing of user information if we have admin panel access to all the countries the user we are editing has access to', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`users/${userAccount1.id}`, {
          body: { email: 'barry.allen@ccpd.gov' },
        });
        const result = await models.user.findById(userAccount1.id);

        expect(result.email).to.deep.equal('barry.allen@ccpd.gov');
      });

      it('Allow editing of user information if we have BES admin access in any country, even if the user we are editing does not have access to that country', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.put(`users/${userAccount2.id}`, {
          body: { email: 'hal.jordan@lantern.corp' },
        });
        const result = await models.user.findById(userAccount2.id);

        expect(result.email).to.deep.equal('hal.jordan@lantern.corp');
      });

      it('Allow editing of user preferences by key', async () => {
        const project_id = generateId();
        const country_id = generateId();

        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`users/${userAccount1.id}`, {
          body: { project_id },
        });
        const result = await models.user.findById(userAccount1.id);
        expect(result).not.to.be.null;
        expect(result.preferences).to.deep.equal({ project_id });

        await app.put(`users/${userAccount1.id}`, {
          body: { country_id },
        });
        const newResult = await models.user.findById(userAccount1.id);
        expect(newResult).not.to.be.null;
        expect(newResult.preferences).to.deep.equal({ project_id, country_id });
      });

      it('Throw an exception if preferences request is incorrectly formatted', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(`users/${userAccount1.id}`, {
          body: {
            preferences: { project_id: generateId() },
          },
        });
        expect(result).to.have.keys('error');
      });
    });
  });
});
