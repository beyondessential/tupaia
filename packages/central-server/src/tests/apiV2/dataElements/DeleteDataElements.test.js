import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for DeleteDataElements', async () => {
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
  let adminElement;
  let publicElement;

  before(async () => {
    const adminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Admin',
    });
    const lesmisAdminPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'LESMIS Admin',
    });
    const publicPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'Public',
    });
    publicElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'PUBLIC_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: ['*', publicPermissionGroup.name],
      },
    );
    adminElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'ADMIN_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: [adminPermissionGroup.name, lesmisAdminPermissionGroup.name],
      },
    );
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('DELETE /dataElements/:id', async () => {
    it('Insufficient permissions: Throw an error if user does not have BES Admin or Tupaia Admin Panel access', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.delete(`dataElements/${adminElement.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Throw an error if the user does not have access to all of the permission groups for a data element', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.delete(`dataElements/${adminElement.id}`);

      expect(result).to.have.keys('error');
    });

    it('Sufficient permissions: Delete a data element we have permission to', async () => {
      const preDelete = await models.dataElement.findById(publicElement.id);
      await app.grantAccess(DEFAULT_POLICY);
      await app.delete(`dataElements/${publicElement.id}`);
      const result = await models.dataElement.findById(publicElement.id);

      expect(preDelete).to.exist;
      expect(result).to.not.exist;
    });

    it('Sufficient permissions: Delete a data element if we are a BES Admin', async () => {
      const preDelete = await models.dataElement.findById(adminElement.id);
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.delete(`dataElements/${adminElement.id}`);
      const result = await models.dataElement.findById(adminElement.id);

      expect(preDelete).to.exist;
      expect(result).to.not.exist;
    });
  });
});
