import { findOrCreateDummyRecord } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';

const DL_ADMIN_PERMISSION_GROUP = 'DL_Test_Admin';
const DL_USER_PERMISSION_GROUP = 'DL_Test_User';
const DL_PUBLIC_PERMISSION_GROUP = 'DL_Test_Public';

const createPermissionsGroups = async models => {
  const besAdminGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: BES_ADMIN_PERMISSION_GROUP,
  });

  const adminPanelGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  });

  const dlAdminGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: DL_ADMIN_PERMISSION_GROUP,
  });

  const dlUserGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: DL_USER_PERMISSION_GROUP,
    parent_id: dlAdminGroup.id,
  });

  const dlPublicGroup = await findOrCreateDummyRecord(models.permissionGroup, {
    name: DL_PUBLIC_PERMISSION_GROUP,
    parent_id: dlUserGroup.id,
  });

  return {
    besAdminGroup,
    adminPanelGroup,
    dlAdminGroup,
    dlUserGroup,
    dlPublicGroup,
  };
};

describe('Get permission groups', async () => {
  const app = new TestableApp();
  const { models } = app;

  const BES_ADMIN_ACCESS_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const ADMIN_PANEL_ACCESS_POLICY = {
    DL: [
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
      DL_ADMIN_PERMISSION_GROUP,
      DL_USER_PERMISSION_GROUP,
      DL_PUBLIC_PERMISSION_GROUP,
    ],
  };

  let permissionGroups = {};

  before(async () => {
    permissionGroups = await createPermissionsGroups(models);
  });

  afterEach(async () => {
    await app.revokeAccess();
  });

  after(async () => {
    await resetTestData();
  });

  describe('Permissions filtering', async () => {
    it('Should return all permission groups for BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_ACCESS_POLICY);
      const response = await app.get('permissionGroups');
      expect(response.body).to.have.length(8);
      expect(response.body.map(group => group.name)).to.have.members([
        BES_ADMIN_PERMISSION_GROUP,
        TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
        DL_ADMIN_PERMISSION_GROUP,
        DL_USER_PERMISSION_GROUP,
        DL_PUBLIC_PERMISSION_GROUP,
        'Donor',
        'Public',
        'Admin',
      ]);
    });

    it('Should return only permission groups an admin panel user has access to', async () => {
      await app.grantAccess(ADMIN_PANEL_ACCESS_POLICY);
      const response = await app.get('permissionGroups');
      expect(response.body).to.have.length(4);
      expect(response.body.map(group => group.name)).to.have.members([
        TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
        DL_ADMIN_PERMISSION_GROUP,
        DL_USER_PERMISSION_GROUP,
        DL_PUBLIC_PERMISSION_GROUP,
      ]);
    });

    it('Should throw an error when user does not have admin panel access', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });
      const response = await app.get('permissionGroups');
      expect(response.status).to.equal(403);
      expect(response.body).to.deep.equal({
        error: 'Need Tupaia Admin Panel access',
      });
    });
  });

  describe('Ancestors requests', async () => {
    it('Should return the permission groups with the ancestores fields if ancestors is column key requested', async () => {
      await app.grantAccess(ADMIN_PANEL_ACCESS_POLICY);
      const response = await app.get('permissionGroups?columns=["ancestors"]');
      expect(response.body).to.have.length(4);
      expect(response.body).to.deep.equal([
        {
          id: permissionGroups.adminPanelGroup.id,
          name: TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
          parent_id: null,
          ancestors: [],
        },
        {
          id: permissionGroups.dlAdminGroup.id,
          name: DL_ADMIN_PERMISSION_GROUP,
          parent_id: null,
          ancestors: [],
        },
        {
          id: permissionGroups.dlUserGroup.id,
          name: DL_USER_PERMISSION_GROUP,
          parent_id: permissionGroups.dlAdminGroup.id,
          ancestors: [
            {
              id: permissionGroups.dlAdminGroup.id,
              name: DL_ADMIN_PERMISSION_GROUP,
              parent_id: null,
            },
          ],
        },
        {
          id: permissionGroups.dlPublicGroup.id,
          name: DL_PUBLIC_PERMISSION_GROUP,
          parent_id: permissionGroups.dlUserGroup.id,
          ancestors: [
            {
              id: permissionGroups.dlUserGroup.id,
              name: DL_USER_PERMISSION_GROUP,
              parent_id: permissionGroups.dlAdminGroup.id,
            },
            {
              id: permissionGroups.dlAdminGroup.id,
              name: DL_ADMIN_PERMISSION_GROUP,
              parent_id: null,
            },
          ],
        },
      ]);
    });
  });

  describe('Single record requests', async () => {
    it('Should return a single permission group record', async () => {
      await app.grantAccess(ADMIN_PANEL_ACCESS_POLICY);
      const response = await app.get(`permissionGroups/${permissionGroups.dlUserGroup.id}`);
      expect(response.body).to.deep.equal({
        id: permissionGroups.dlUserGroup.id,
        name: DL_USER_PERMISSION_GROUP,
        parent_id: permissionGroups.dlAdminGroup.id,
      });
    });
  });
});
