import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for EditUserEntityPermissions', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    LA: ['Admin', 'Public'],
    TO: ['Admin', 'Public'],
  };

  const BES_ADMIN_POLICY = {
    SB: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let vanuatuPublicPermission;
  let kiribatiBESPermission;
  let laosPublicPermission;
  let besPermissionGroupId;
  let userAccountId2;

  before(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    const besPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: BES_ADMIN_PERMISSION_GROUP,
    });
    besPermissionGroupId = besPermissionGroup.id;

    const { entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
    });
    const { entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
    });
    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });

    // Create test users
    const userAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'Clark',
      last_name: 'EditUserEntityPermissions',
    });
    const userAccount2 = await findOrCreateDummyRecord(models.user, {
      first_name: 'Bruce',
      last_name: 'EditUserEntityPermissions',
    });
    userAccountId2 = userAccount2.id;

    // Give the test user some permissions
    vanuatuPublicPermission = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: vanuatuEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    kiribatiBESPermission = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: besPermissionGroup.id,
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

  describe('PUT /userEntityPermissions/:id', async () => {
    describe('Insufficient permissions', async () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await app.grantAccess(policy);
        const { body: result } = await app.put(`userEntityPermissions/${laosPublicPermission.id}`, {
          body: {
            user_id: userAccountId2,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when editing a user entity permission when we do not have permissions for the specific entity', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(`userEntityPermissions/${laosPublicPermission.id}`, {
          body: {
            user_id: userAccountId2,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit a user entity permission to point to an entity we lack permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `userEntityPermissions/${vanuatuPublicPermission.id}`,
          {
            body: {
              entity_id: laosPublicPermission.entity_id,
            },
          },
        );

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit a user entity permission that contains the BES Admin permission group', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `userEntityPermissions/${kiribatiBESPermission.id}`,
          {
            body: {
              user_id: userAccountId2,
            },
          },
        );

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to edit a user entity permission to point to BES Admin permission group', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.put(
          `userEntityPermissions/${kiribatiBESPermission.id}`,
          {
            body: {
              permission_group_id: besPermissionGroupId,
            },
          },
        );

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permissions', async () => {
      it('Edit a user entity permission we have access to the entity of', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.put(`userEntityPermissions/${vanuatuPublicPermission.id}`, {
          body: {
            user_id: userAccountId2,
          },
        });
        const result = await models.userEntityPermission.findById(vanuatuPublicPermission.id);

        expect(result.user_id).to.equal(userAccountId2);
      });

      it('Edit any user entity permission as BES Admin', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.put(`userEntityPermissions/${kiribatiBESPermission.id}`, {
          body: {
            user_id: userAccountId2,
          },
        });
        const result = await models.userEntityPermission.findById(kiribatiBESPermission.id);

        expect(result.user_id).to.equal(userAccountId2);
      });
    });
  });
});
