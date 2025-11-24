import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp } from '../../testUtilities';

describe('Permissions checker for GETDataElements', async () => {
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
  let wildcardElement;
  let adminElement;
  let publicElement;
  let besAdminElement;

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
    wildcardElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'WILDCARD_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: ['*'],
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
    publicElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'PUBLIC_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: [publicPermissionGroup.name],
      },
    );
    besAdminElement = await findOrCreateDummyRecord(
      models.dataElement,
      {
        code: 'BES_ELEMENT',
        service_type: 'tupaia',
      },
      {
        permission_groups: [besPermissionGroup.name],
      },
    );
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /dataElements/:id', async () => {
    it('Sufficient permissions: Should return a requested data element if users have access to any of the permission groups', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dataElements/${adminElement.id}`);

      expect(result.id).to.equal(adminElement.id);
    });

    it('Sufficient permissions: Should always return a wildcard data element', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dataElements/${wildcardElement.id}`);

      expect(result.id).to.equal(wildcardElement.id);
    });

    it('Sufficient permissions: Should always return for a BES Admin', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`dataElements/${adminElement.id}`);

      expect(result.id).to.equal(adminElement.id);
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the data element permission groups', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dataElements/${besAdminElement.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dataElements', async () => {
    let filterString;
    before(() => {
      // Set up a filter string to only request the test data we set up
      const elementIds = [
        wildcardElement.id,
        adminElement.id,
        publicElement.id,
        besAdminElement.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${elementIds.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Return only the list of data elements we have permissions for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`dataElements?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        wildcardElement.id,
        adminElement.id,
        publicElement.id,
      ]);
    });

    it('Sufficient permissions: Should return the full list of data elements if we have BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dataElements?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        wildcardElement.id,
        adminElement.id,
        publicElement.id,
        besAdminElement.id,
      ]);
    });

    it('Insufficient permissions: Should only return wildcard elements if we have permissions for no data elements', async () => {
      const policy = {
        DL: ['LESMIS Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dataElements?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([wildcardElement.id]);
    });
  });
});
