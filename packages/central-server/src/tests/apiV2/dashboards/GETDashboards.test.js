import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { TestableApp, resetTestData, setupDashboardTestData } from '../../testUtilities';

describe('Permissions checker for GETDashboards', async () => {
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
  let districtDashboard1;
  let nationalDashboard1;
  let nationalDashboard2;
  let projectDashboard1;

  before(async () => {
    await resetTestData();

    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [
          { code: 'KI', country_code: 'KI' },
          { code: 'VU', country_code: 'VU' },
          { code: 'TO', country_code: 'TO' },
          { code: 'SB', country_code: 'SB' },
          { code: 'LA', country_code: 'LA' },
        ],
      },
    ]);

    ({ districtDashboard1, nationalDashboard1, nationalDashboard2, projectDashboard1 } =
      await setupDashboardTestData(models));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /dashboards/:id', async () => {
    it('Sufficient permissions: Should return a requested dashboard if users have access to any of the inner dashboard relations', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboards/${nationalDashboard1.id}`);

      expect(result.id).to.equal(nationalDashboard1.id);
    });

    it('Sufficient permissions: Should return a requested project level dashboard if users have access to any inner relations and the project child countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboards/${projectDashboard1.id}`);

      expect(result.id).to.equal(projectDashboard1.id);
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the inner dashboard relations', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access facilityDashboardGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin', 'Public'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboards/${districtDashboard1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an exception if dashboards are project level and users do not have access to any of their child countries', async () => {
      // Remove Admin permission of TO, SB, KI, VU to have insufficient permissions to access the project level dashboard.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */, 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */, 'Public'],
        LA: [/* 'Admin' */ 'Public'],
        TO: [/* 'Admin' */ 'Public'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`dashboards/${projectDashboard1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dashboards', async () => {
    let filterString;
    before(() => {
      const dashboardIds = [
        districtDashboard1.id,
        nationalDashboard1.id,
        nationalDashboard2.id,
        projectDashboard1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${dashboardIds.join(
        '","',
      )}"]}}`;
    });

    it('Sufficient permissions: Return only the list of dashboards we have permissions for', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin', */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dashboards?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboard1.id,
        nationalDashboard2.id,
        projectDashboard1.id,
      ]);
    });

    it('Sufficient permissions: Should return the full list of dashboard if we have BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dashboards?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtDashboard1.id,
        nationalDashboard1.id,
        nationalDashboard2.id,
        projectDashboard1.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if we have permissions for no dashboards', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`dashboards?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
