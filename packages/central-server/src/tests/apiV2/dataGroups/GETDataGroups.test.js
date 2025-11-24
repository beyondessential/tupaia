import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for GETDataGroups', async () => {
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
  let besAdminGroup;

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
    const besPermissionGroup = await findOrCreateDummyRecord(models.permissionGroup, {
      name: 'BES Admin',
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
    const besAdminElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'BES_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: [besPermissionGroup.name],
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
    besAdminGroup = await findOrCreateDummyRecord(models.dataGroup, {
      code: 'BES_ADMIN_GROUP',
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

    await findOrCreateDummyRecord(models.dataElementDataGroup, {
      data_group_id: besAdminGroup.id,
      data_element_id: adminElement.id,
    });
    await findOrCreateDummyRecord(models.dataElementDataGroup, {
      data_group_id: besAdminGroup.id,
      data_element_id: besAdminElement.id,
    });
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /dataGroups/:id', async () => {
    it('Sufficient permissions: Should return a requested data group if the user has access to all data elements within', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dataGroups/${publicGroup.id}`);

      expect(result.id).to.equal(publicGroup.id);
    });

    it('Sufficient permissions: Should always return for a BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`dataGroups/${adminGroup.id}`);

      expect(result.id).to.equal(adminGroup.id);
    });

    it('Insufficient permissions: Should throw an error if the user does not have access to any of the data elements within the data group', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dataGroups/${besAdminGroup.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dataGroups', async () => {
    let filterString;
    before(() => {
      // Set up a filter string to only request the test data we set up
      const groupIds = [adminGroup.id, publicGroup.id, besAdminGroup.id];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${groupIds.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Return only the list of data groups we have permissions for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`dataGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([publicGroup.id, adminGroup.id]);
    });

    it('Sufficient permissions: Should return the full list of data groups if we have BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dataGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        publicGroup.id,
        adminGroup.id,
        besAdminGroup.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty list if we have permission to no data groups', async () => {
      const policy = {
        DL: ['LESMIS Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dataGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([]);
    });
  });
});
