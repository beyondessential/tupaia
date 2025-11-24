import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for EditDataGroups', async () => {
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
  let publicGroup;
  let adminGroup;

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
    const wildcardElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'WILDCARD_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: ['*'],
      },
    );
    const publicElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'PUBLIC_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: [publicPermissionGroup.name],
      },
    );
    const adminElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'ADMIN_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: [adminPermissionGroup.name, lesmisAdminPermissionGroup.name],
      },
    );

    publicGroup = await findOrCreateDummyRecord(models.dataGroup, {
      code: 'PUBLIC_GROUP',
      service_type: 'tupaia',
    });
    adminGroup = await findOrCreateDummyRecord(models.dataGroup, {
      code: 'ADMIN_GROUP',
      service_type: 'tupaia',
    });

    await findOrCreateDummyRecord(models.dataElementDataGroup, {
      data_group_id: publicGroup.id,
      data_element_id: wildcardElement.id,
    });
    await findOrCreateDummyRecord(models.dataElementDataGroup, {
      data_group_id: publicGroup.id,
      data_element_id: publicElement.id,
    });

    await findOrCreateDummyRecord(models.dataElementDataGroup, {
      data_group_id: adminGroup.id,
      data_element_id: publicElement.id,
    });
    await findOrCreateDummyRecord(models.dataElementDataGroup, {
      data_group_id: adminGroup.id,
      data_element_id: adminElement.id,
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('DELETE /dataGroups/:id', async () => {
    it('Insufficient permissions: Throw an error if the user does not have BES Admin or Tupaia Admin Panel access', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.delete(`dataGroups/${publicGroup.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Throw an error if the user does not have full access to all of the data elements within a data group', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.delete(`dataGroups/${adminGroup.id}`);

      expect(result).to.have.keys('error');
    });

    it('Sufficient permissions: Edit a data group we have permission to', async () => {
      const preDelete = await models.dataGroup.findById(publicGroup.id);
      await app.grantAccess(DEFAULT_POLICY);
      await app.delete(`dataGroups/${publicGroup.id}`);
      const result = await models.dataGroup.findById(publicGroup.id);

      expect(preDelete).to.exist;
      expect(result).to.not.exist;
    });

    it('Sufficient permissions: Edit a data group if we are a BES Admin', async () => {
      const preDelete = await models.dataGroup.findById(adminGroup.id);
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.delete(`dataGroups/${adminGroup.id}`);
      const result = await models.dataGroup.findById(adminGroup.id);

      expect(preDelete).to.exist;
      expect(result).to.not.exist;
    });
  });
});
