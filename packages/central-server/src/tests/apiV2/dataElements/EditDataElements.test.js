import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for EditDataElements', async () => {
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

  describe('PUT /dataElements/:id', async () => {
    it('Insufficient permissions: Throw an error if user does not have BES Admin or Tupaia Admin Panel access', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.put(`dataElements/${adminElement.id}`, {
        body: { code: 'no_access' },
      });

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Throw an error if the user does not have access to all of the permission groups for a data element', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.put(`dataElements/${adminElement.id}`, {
        body: { code: 'no_lesmis_admin' },
      });

      expect(result).to.have.keys('error');
    });

    it('Sufficient permissions: Edit a data element we have permission to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const newCode = 'allow_editing';
      await app.put(`dataElements/${publicElement.id}`, {
        body: { code: newCode },
      });
      const result = await models.dataElement.findById(publicElement.id);

      expect(result.code).to.equal(newCode);
    });

    it('Sufficient permissions: Edit a data element if we are a BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const newCode = 'always_allow_bes';
      await app.put(`dataElements/${adminElement.id}`, {
        body: { code: newCode },
      });
      const result = await models.dataElement.findById(adminElement.id);

      expect(result.code).to.equal(newCode);
    });
  });
});
