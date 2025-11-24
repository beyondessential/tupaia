import { findOrCreateDummyRecord } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData } from '../../testUtilities';

const DL_ADMIN_PERMISSION_GROUP = 'DL_Test_Admin';

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

  return {
    besAdminGroup,
    adminPanelGroup,
    dlAdminGroup,
  };
};

describe('Create permission group', async () => {
  const app = new TestableApp();
  const { models } = app;

  const BES_ADMIN_ACCESS_POLICY = {
    DL: [BES_ADMIN_PERMISSION_GROUP, TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const ADMIN_PANEL_ACCESS_POLICY = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
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

  describe('Permissions checker', async () => {
    it('Should allow BES Admin users to always create a permission group with any parent', async () => {
      await app.grantAccess(BES_ADMIN_ACCESS_POLICY);
      const response = await app.post('permissionGroups', {
        body: {
          name: 'Test dl admin child',
          parent_id: permissionGroups.dlAdminGroup.id,
        },
      });
      expect(response.status).to.equal(200);
    });

    it('Should allow Tupaia Admin Panel users to create a permission group with a parent they have access to', async () => {
      await app.grantAccess(ADMIN_PANEL_ACCESS_POLICY);
      const response = await app.post('permissionGroups', {
        body: {
          name: 'Test Admin child',
          parent_id: permissionGroups.adminPanelGroup.id,
        },
      });
      expect(response.status).to.equal(200);
    });

    it('Should not allow Tupaia Admin Panel users to create a permission group without a parent', async () => {
      await app.grantAccess(ADMIN_PANEL_ACCESS_POLICY);
      const response = await app.post('permissionGroups', {
        body: {
          name: 'Test Admin no parent',
        },
      });
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.equal(
        'One of the following conditions need to be satisfied:\nNeed BES Admin access\nParent permission group is required',
      );
    });

    it('Should not allow Tupaia Admin Panel users to create a permission group with a parent they do not have access to', async () => {
      await app.grantAccess(ADMIN_PANEL_ACCESS_POLICY);
      const response = await app.post('permissionGroups', {
        body: {
          name: 'Test DL admin child',
          parent_id: permissionGroups.dlAdminGroup.id,
        },
      });
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.equal(
        'One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access to the parent permission group',
      );
    });

    it('Should not allow non admin panel users to create a permission group', async () => {
      await app.grantAccess({
        DL: ['Public'],
      });
      const response = await app.post('permissionGroups', {
        body: {
          name: 'Test DL admin child',
          parent_id: permissionGroups.dlAdminGroup.id,
        },
      });
      expect(response.status).to.equal(403);
      expect(response.body).to.have.property('error');
      expect(response.body.error).to.equal(
        'One of the following conditions need to be satisfied:\nNeed BES Admin access\nNeed Tupaia Admin Panel access',
      );
    });
  });
});
