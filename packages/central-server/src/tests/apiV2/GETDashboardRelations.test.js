import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertProjectsAndHierarchies,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupDashboardTestData } from '../testUtilities';

describe('Permissions checker for GETDashboardRelations', async () => {
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
  let nationalDashboard1;
  let nationalDashboardItem3;
  let districtDashboardRelation1;
  let nationalDashboardRelation1;
  let nationalDashboardRelation2;
  let nationalDashboardRelation3a;
  let nationalDashboardRelation3b;
  let projectDashboardRelation1;

  before(async () => {
    // Still create these existing entities just in case test database for some reasons do not have these records.
    await findOrCreateDummyRecord(models.entity, {
      code: 'KI_Phoenix Islands',
      type: 'district',
      country_code: 'KI',
    });

    await addBaselineTestCountries(models);

    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [{ code: 'KI' }, { code: 'VU' }, { code: 'TO' }, { code: 'SB' }],
      },
    ]);

    ({
      nationalDashboard1,
      nationalDashboardItem3,
      districtDashboardRelation1,
      nationalDashboardRelation1,
      nationalDashboardRelation2,
      nationalDashboardRelation3a,
      nationalDashboardRelation3b,
      projectDashboardRelation1,
    } = await setupDashboardTestData(models));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /dashboardRelations/:id', async () => {
    it('Sufficient permissions: Should return requested dashboard relation which connected to SUB NATIONAL dashboard that users have access to the country of dashboard root_entity_code', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardRelations/${districtDashboardRelation1.id}`);

      expect(result.id).to.equal(districtDashboardRelation1.id);
    });

    it('Sufficient permissions: Should return requested dashboard relation connected to NATIONAL dashboard that users have access to dashboard root_entity_code', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardRelations/${nationalDashboardRelation1.id}`);

      expect(result.id).to.equal(nationalDashboardRelation1.id);
    });

    it('Sufficient permissions: Should return requested dashboard relation connected to a project level dashboard that users have access to any of the project child countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardRelations/${projectDashboardRelation1.id}`);

      expect(result.id).to.equal(projectDashboardRelation1.id);
    });

    it('Insufficient permissions: Should throw an error when requesting dashboard relation connected to SUB NATIONAL dashboard that users do not have access', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access districtDashboardRelation1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboardRelations/${districtDashboardRelation1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting dashboard relation connected to NATIONAL dashboard that users do not have access', async () => {
      // Remove admin permission of KI, LA to have insufficient permissions to access nationalDashboardRelation3a.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(
        `dashboardRelations/${nationalDashboardRelation3a.id}`,
      );

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting dashboard relation connected to a project level dashboard that users have access to any of the project child countries', async () => {
      // Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level dashboard.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        LA: ['Admin'],
        TO: [/* 'Admin' */ 'Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboardRelations/${projectDashboardRelation1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dashboardRelations', async () => {
    let filterString;

    before(() => {
      const dashboardRelations = [
        districtDashboardRelation1.id,
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
        projectDashboardRelation1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${dashboardRelations.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Should return all dashboard relations that users have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`dashboardRelations?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtDashboardRelation1.id,
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
        projectDashboardRelation1.id,
      ]);
    });

    it('Sufficient permissions: Should return all dashboard relations if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dashboardRelations?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtDashboardRelation1.id,
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
        projectDashboardRelation1.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if the user has permissions for no dashboard relations', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dashboardRelations?${filterString}`);

      expect(results).to.be.empty;
    });
  });

  describe('GET /dashboards/:id/dashboardRelations', async () => {
    let filterString;

    before(() => {
      const dashboardRelations = [
        districtDashboardRelation1.id,
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
        projectDashboardRelation1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${dashboardRelations.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Should return all dashboard relations that users have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `dashboards/${nationalDashboard1.id}/dashboardRelations?${filterString}`,
      );

      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
      ]);
    });

    it('Sufficient permissions: Should return all dashboard relations if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(
        `dashboards/${nationalDashboard1.id}/dashboardRelations?${filterString}`,
      );
      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if the user has permissions for no dashboard relations', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(
        `dashboards/${nationalDashboard1.id}/dashboardRelations?${filterString}`,
      );

      expect(results).to.have.keys('error');
    });
  });

  describe('GET /dashboardItems/:id/dashboardRelations', async () => {
    let filterString;

    before(() => {
      const dashboardRelations = [
        districtDashboardRelation1.id,
        nationalDashboardRelation1.id,
        nationalDashboardRelation2.id,
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
        projectDashboardRelation1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${dashboardRelations.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Should return all dashboard relations that users have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(
        `dashboardItems/${nationalDashboardItem3.id}/dashboardRelations?${filterString}`,
      );

      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
      ]);
    });

    it('Sufficient permissions: Should return all dashboard relations if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(
        `dashboardItems/${nationalDashboardItem3.id}/dashboardRelations?${filterString}`,
      );
      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardRelation3a.id,
        nationalDashboardRelation3b.id,
      ]);
    });

    it('Insufficient permissions: Should throw an error if the user has permissions for no dashboard relations', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(
        `dashboardItems/${nationalDashboardItem3.id}/dashboardRelations?${filterString}`,
      );

      expect(results).to.have.keys('error');
    });
  });
});
