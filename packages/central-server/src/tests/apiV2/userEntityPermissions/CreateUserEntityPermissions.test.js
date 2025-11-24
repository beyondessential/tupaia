import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for CreateUserEntityPermissions', async () => {
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
  let userAccountId;
  let publicPermissionGroupId;
  let besPermissionGroupId;
  let vanuatuEntityId;
  let laosEntityId;

  before(async () => {
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    const besPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: BES_ADMIN_PERMISSION_GROUP,
    });
    publicPermissionGroupId = publicPermissionGroup.id;
    besPermissionGroupId = besPermissionGroup.id;

    const { entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
    });
    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });
    vanuatuEntityId = vanuatuEntity.id;
    laosEntityId = laosEntity.id;

    // Create test users
    const userAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'Clark',
      last_name: 'CreateUserEntityPermissions',
    });
    userAccountId = userAccount.id;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('POST /userEntityPermissions', async () => {
    describe('Insufficient permission', async () => {
      it('Throw a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
        const policy = {
          DL: ['Public'],
        };
        await app.grantAccess(policy);
        const { body: result } = await app.post(`userEntityPermissions`, {
          body: {
            user_id: userAccountId,
            permission_group_id: publicPermissionGroupId,
            entity_id: laosEntityId,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to create a user entity permission for an entity we do not have permissions for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`userEntityPermissions`, {
          body: {
            user_id: userAccountId,
            permission_group_id: publicPermissionGroupId,
            entity_id: laosEntityId,
          },
        });

        expect(result).to.have.keys('error');
      });

      it('Throw an exception when trying to create a user entity permission with BES admin access when we lack BES admin access', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        const { body: result } = await app.post(`userEntityPermissions`, {
          body: {
            user_id: userAccountId,
            permission_group_id: besPermissionGroupId,
            entity_id: vanuatuEntityId,
          },
        });

        expect(result).to.have.keys('error');
      });
    });

    describe('Sufficient permission', async () => {
      it('Allow creation of user entity permission for entity we have permission for', async () => {
        await app.grantAccess(DEFAULT_POLICY);
        await app.post(`userEntityPermissions`, {
          body: {
            user_id: userAccountId,
            permission_group_id: publicPermissionGroupId,
            entity_id: laosEntityId,
          },
        });
        const result = await models.userEntityPermission.find({
          user_id: userAccountId,
          permission_group_id: publicPermissionGroupId,
          entity_id: laosEntityId,
        });

        expect(result).to.not.equal(null);
      });

      it('Allow creation of any user entity permission for BES admin user', async () => {
        await app.grantAccess(BES_ADMIN_POLICY);
        await app.post(`userEntityPermissions`, {
          body: {
            user_id: userAccountId,
            permission_group_id: besPermissionGroupId,
            entity_id: vanuatuEntityId,
          },
        });
        const result = await models.userEntityPermission.find({
          user_id: userAccountId,
          permission_group_id: besPermissionGroupId,
          entity_id: vanuatuEntityId,
        });

        expect(result).to.not.equal(null);
      });
    });
  });
});
