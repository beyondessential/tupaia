import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord, findOrCreateDummyCountryEntity } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { resetTestData, TestableApp } from '../../testUtilities';

describe('Permissions checker for GETAccessRequests', async () => {
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
  let accessRequest1;
  let accessRequest2;
  let accessRequest3;
  let accessRequestIds;
  let filterString;

  before(async () => {
    await resetTestData();

    const { entity: vanuatuEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
    });

    const { entity: kiribatiEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
    });

    const { entity: laosEntity } = await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
    });

    accessRequest1 = await findOrCreateDummyRecord(models.accessRequest, {
      entity_id: vanuatuEntity.id,
      processed_by: null,
    });
    accessRequest2 = await findOrCreateDummyRecord(models.accessRequest, {
      entity_id: kiribatiEntity.id,
      processed_by: null,
    });
    accessRequest3 = await findOrCreateDummyRecord(models.accessRequest, {
      entity_id: laosEntity.id,
      processed_by: null,
    });

    // Create a filter string so we are only requesting the test data from the endpoint
    accessRequestIds = [accessRequest1.id, accessRequest2.id, accessRequest3.id];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${accessRequestIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /accessRequests/:id', async () => {
    it('Sufficient permissions: Return a requested access request if we have admin panel access to the entity the access request is for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`accessRequests/${accessRequest1.id}`);

      expect(result.id).to.equal(accessRequest1.id);
    });

    it('Sufficient permissions: Return a requested access request if we have BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`accessRequests/${accessRequest1.id}`);

      expect(result.id).to.equal(accessRequest1.id);
    });

    it('Insufficient permissions: Throw an exception if we do not have access to entity of the access request', async () => {
      const policy = {
        DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`accessRequests/${accessRequest1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /accessRequests', async () => {
    it('Sufficient permissions: Return only the list of entries we have permissions for', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`accessRequests?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([accessRequest1.id, accessRequest2.id]);
    });

    it('Sufficient permissions: Return the full list of access requests if we have BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`accessRequests?${filterString}`);

      expect(results.map(r => r.id)).to.have.members(accessRequestIds);
    });

    it('Insufficient permissions: Throws a permissions gate error if we do not have BES admin or Tupaia Admin panel access anywhere', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`accessRequests?${filterString}`);

      expect(results).to.have.keys('error');
    });

    it('Insufficient permissions: Return an empty array if we have permissions to no access requests', async () => {
      const policy = {
        DL: ['Public', TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`accessRequests?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
