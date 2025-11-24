import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { addBaselineTestCountries, buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupMapOverlayTestData } from '../testUtilities';

describe('Permissions checker for GETMapOverlayGroupRelations', async () => {
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
  let nationalMapOverlayGroupRelation1;
  let nationalMapOverlayGroupRelation2;
  let projectLevelMapOverlayGroupRelation1;
  let filterString;

  before(async () => {
    // Still create these existing entities just in case test database for some reasons do not have these records.
    await addBaselineTestCountries(models);

    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [{ code: 'KI' }, { code: 'VU' }, { code: 'TO' }, { code: 'SB' }],
      },
    ]);

    // Set up the map overlays
    ({
      nationalMapOverlayGroupRelation1,
      nationalMapOverlayGroupRelation2,
      projectLevelMapOverlayGroupRelation1,
    } = await setupMapOverlayTestData(models));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /mapOverlayGroupRelations/:id', async () => {
    it('Sufficient permissions: Should return a requested map overlay group relation that users have access to the child map overlay item', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(
        `mapOverlayGroupRelations/${nationalMapOverlayGroupRelation1.id}`,
      );

      expect(result.id).to.equal(nationalMapOverlayGroupRelation1.id);
    });

    it('Sufficient permissions: Should return a requested project level map overlay group relation that users have access to the child map overlay item', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(
        `mapOverlayGroupRelations/${projectLevelMapOverlayGroupRelation1.id}`,
      );

      expect(result.id).to.equal(projectLevelMapOverlayGroupRelation1.id);
    });

    it('Insufficient permissions: Should throw an error if requesting map overlay group relation that users do not have access to the child map overlay item', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: result } = await app.get(
        `mapOverlayGroupRelations/${nationalMapOverlayGroupRelation1.id}`,
      );

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error if requesting project level map overlay group relation that users do not have access to the child map overlay item', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: result } = await app.get(
        `mapOverlayGroupRelations/${projectLevelMapOverlayGroupRelation1.id}`,
      );

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /mapOverlayGroupRelations', async () => {
    before(() => {
      const mapOverlayGroupRelationIds = [
        nationalMapOverlayGroupRelation1.id,
        nationalMapOverlayGroupRelation2.id,
        projectLevelMapOverlayGroupRelation1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${mapOverlayGroupRelationIds.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Return only the list of entries we have permission for', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        /* LA: ['Admin'], */
        TO: ['Admin'],
      };
      app.grantAccess(policy);
      const { body: results } = await app.get(`mapOverlayGroupRelations?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlayGroupRelation1.id,
        projectLevelMapOverlayGroupRelation1.id,
      ]);
    });

    it('Sufficient permissions: Should return the full list of map overlay group relations if we have BES admin access', async () => {
      app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`mapOverlayGroupRelations?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlayGroupRelation1.id,
        nationalMapOverlayGroupRelation2.id,
        projectLevelMapOverlayGroupRelation1.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if users do not have access to any of the map overlay group relations', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: results } = await app.get(`mapOverlayGroupRelations?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
