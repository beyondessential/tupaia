import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for GETUserEntityPermissions', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin', 'Public'],
    LA: ['Admin', 'Public'],
    TO: ['Admin', 'Public'],
  };

  const BES_ADMIN_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let userEntityPermission1;
  let userEntityPermission2;
  let userEntityPermission3;
  let userEntityPermissionIds;
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

    // Create test users
    const userAccount = await findOrCreateDummyRecord(models.user, {
      first_name: 'Clark',
      last_name: 'GETUserEntityPermissions',
    });

    // Give the test user some permissions
    userEntityPermission1 = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: vanuatuEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    userEntityPermission2 = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: kiribatiEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });
    userEntityPermission3 = await findOrCreateDummyRecord(models.userEntityPermission, {
      user_id: userAccount.id,
      entity_id: laosEntity.id,
      permission_group_id: publicPermissionGroup.id,
    });

    // Create a filter string so we are only requesting the test data from the endpoint
    userEntityPermissionIds = [
      userEntityPermission1.id,
      userEntityPermission2.id,
      userEntityPermission3.id,
    ];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${userEntityPermissionIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /userEntityPermissions/:id', async () => {
    it('Sufficient permissions: Return a requested user entity permission if we have access to the specific entity', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`userEntityPermissions/${userEntityPermission2.id}`);

      expect(result.id).to.equal(userEntityPermission2.id);
    });

    it('Sufficient permissions: Return a requested user entity permission if we have BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`userEntityPermissions/${userEntityPermission2.id}`);

      expect(result.id).to.equal(userEntityPermission2.id);
    });

    it('Insufficient permissions: Throw an exception if we do not have permissions for the entity of the user entity permission', async () => {
      const policy = {
        DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`userEntityPermissions/${userEntityPermission2.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /userEntityPermissions', async () => {
    it('Sufficient permissions: Return only the list of user entity permissions we have permissions for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`userEntityPermissions?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([
        userEntityPermission1.id,
        userEntityPermission2.id,
      ]);
    });

    it('Sufficient permissions: Return the full list of user entity permissions if we have BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`userEntityPermissions?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(userEntityPermissionIds);
    });

    it('Insufficient permissions: Throws a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`userEntityPermissions?${filterString}`);

      expect(results).have.keys('error');
    });

    it('Insufficient permissions: Return an empty array if we have permissions to no user entity permissions', async () => {
      const policy = {
        DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`userEntityPermissions?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
