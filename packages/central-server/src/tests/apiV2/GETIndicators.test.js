import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../testUtilities';

describe('Permissions checker for GETIndicators', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let indicatorAId;
  let indicatorBId;
  let filterString;

  before(async () => {
    const indicatorA = await findOrCreateDummyRecord(models.indicator, {
      code: 'TEST_A',
      builder: 'arithmetic',
      config: '{}',
    });
    const indicatorB = await findOrCreateDummyRecord(models.indicator, {
      code: 'TEST_B',
      builder: 'arithmetic',
      config: '{}',
    });

    indicatorAId = indicatorA.id;
    indicatorBId = indicatorB.id;

    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${indicatorAId}","${indicatorBId}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /indicators/:id', async () => {
    it('Sufficient permissions: Return requested indicator if user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.get(`indicators/${indicatorAId}`);

      expect(result.id).to.equal(indicatorAId);
    });

    it('Insufficient permissions: Return an error message if user does not have BES admin access', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`indicators/${indicatorAId}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /indicators', async () => {
    it('Sufficient permissions: Return all indicators if user has BES admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`indicators?${filterString}`);

      expect(results.map(r => r.id)).to.have.members([indicatorAId, indicatorBId]);
    });

    it('Insufficient permissions: Return an error message if user does not have BES admin access', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`indicators?${filterString}`);

      expect(results).to.have.keys('error');
    });
  });
});
