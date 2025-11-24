import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for DeleteUserEntityPermissions', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    LA: ['Admin', 'Public'],
    TO: ['Admin', 'Public'],
  };

  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let vanuatuPublicPermission;
  let vanuatuCatPermission;
  let laosPublicPermission;

  before(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    const catPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Cat',
    });

    const { entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
    });
    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });

    // Create test users
    const userAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'Clark',
      last_name: 'DeleteUserEntityPermissions',
    });

    // Give the test user some permissions
    vanuatuPublicPermission = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: vanuatuEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    vanuatuCatPermission = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: vanuatuEntity.id,
      permission_group_id: catPermissionGroup.id,
    });
    laosPublicPermission = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('DELETE /userEntityPermissions/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await app.grantAccess(policy);
        const { body: result } = await app.delete(
          `userEntityPermissions/${vanuatuPublicPermission.id}`,
        );
        const record = await models.userEntityPermission.findById(vanuatuPublicPermission.id);

        expect(result).have.to.keys('error');
        expect(record).to.not.equal(null);
      });

      it('Throw an exception if we do not have permissions for the entity of the user entity permission', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.delete(
          `userEntityPermissions/${laosPublicPermission.id}`,
        );
        const record = await models.userEntityPermission.findById(laosPublicPermission.id);

        expect(result).to.have.keys('error');
        expect(record).to.not.equal(null);
      });

      it('Throw an exception if we do not have permissions for the permission of the user entity permission', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.delete(
          `userEntityPermissions/${vanuatuCatPermission.id}`,
        );
        const record = await models.userEntityPermission.findById(vanuatuCatPermission.id);

        expect(result).to.have.keys('error');
        expect(record).to.not.equal(null);
      });
    });

    describe('Sufficient permissions', async () => {
      it('Delete a user entity permission if we have admin panel access to the specific entity', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.delete(`userEntityPermissions/${vanuatuPublicPermission.id}`);
        const result = await models.userEntityPermission.findById(vanuatuPublicPermission.id);

        expect(result).to.equal(null);
      });

      it('BES Admin user can delete any user entity permission', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.delete(`userEntityPermissions/${laosPublicPermission.id}`);
        const result = await models.userEntityPermission.findById(laosPublicPermission.id);

        expect(result).to.equal(null);
      });
    });
  });
});
