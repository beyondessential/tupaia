import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertProjectsAndHierarchies,
} from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, setupDashboardTestData } from '../../testUtilities';

describe('Permissions checker for GETDashboardItems', async () => {
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
  let districtDashboardItem1;
  let nationalDashboardItem1;
  let nationalDashboardItem2;
  let nationalDashboardItem3;
  let projectDashboardItem1;

  before(async () => {
    // Still create these existing entities just in case test database for some reason does not have these records.
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
      districtDashboardItem1,
      nationalDashboardItem1,
      nationalDashboardItem2,
      nationalDashboardItem3,
      projectDashboardItem1,
    } = await setupDashboardTestData(models));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /dashboardItems/:id', async () => {
    it('Sufficient permissions: Should return requested dashboard item connected to a SUB NATIONAL dashboard that users have access to any of their relations', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardItems/${districtDashboardItem1.id}`);

      expect(result.id).to.equal(districtDashboardItem1.id);
    });

    it('Sufficient permissions: Should return requested dashboard item connected to a NATIONAL dashboard that users have access to any of their relations', async () => {
      // Remove the permission of LA since KI permissions should be enough to access nationalDashboardItem3.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboardItems/${nationalDashboardItem3.id}`);

      expect(result.id).to.equal(nationalDashboardItem3.id);
    });

    it('Sufficient permissions: Should return requested dashboard item connected to a project level dashboard that users have access to any of the project child countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardItems/${projectDashboardItem1.id}`);

      expect(result.id).to.equal(projectDashboardItem1.id);
    });

    it('Insufficient permissions: Should throw an error when requesting a dashboard item connected to a SUB NATIONAL dashboard that users do not have access to their relations', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access districtDashboardItem1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboardItems/${districtDashboardItem1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting a dashboard item connected to a NATIONAL dashboard that users do not have access to their relations', async () => {
      // Remove admin permission of KI, LA to have insufficient permissions to access nationalDashboardItem3.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboardItems/${nationalDashboardItem3.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting a dashboard item connected to a project level dashboard that users have access to any of the project child countries', async () => {
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
      const { body: result } = await app.get(`dashboardItems/${projectDashboardItem1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dashboardItems', async () => {
    let filterString;

    before(async () => {
      const dashboardItemIds = [
        districtDashboardItem1.id,
        nationalDashboardItem1.id,
        nationalDashboardItem2.id,
        nationalDashboardItem3.id,
        projectDashboardItem1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${dashboardItemIds.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Should return all dashboard items that users have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`dashboardItems?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtDashboardItem1.id,
        nationalDashboardItem1.id,
        nationalDashboardItem2.id,
        nationalDashboardItem3.id,
        projectDashboardItem1.id,
      ]);
    });

    it('Sufficient permissions: Should return all dashboard items if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dashboardItems?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtDashboardItem1.id,
        nationalDashboardItem1.id,
        nationalDashboardItem2.id,
        nationalDashboardItem3.id,
        projectDashboardItem1.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if the user has permissions for no dashboard items', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dashboardItems?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
