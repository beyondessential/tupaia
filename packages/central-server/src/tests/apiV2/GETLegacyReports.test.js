import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertProjectsAndHierarchies,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupDashboardTestData } from '../testUtilities';

describe('Permissions checker for GETLegacyReports', async () => {
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
  let districtLegacyReport1;
  let nationalLegacyReport1;
  let nationalLegacyReport2;
  let nationalLegacyReport3;
  let projectLegacyReport1;
  let filterString;

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
      districtLegacyReport1,
      nationalLegacyReport1,
      nationalLegacyReport2,
      nationalLegacyReport3,
      projectLegacyReport1,
    } = await setupDashboardTestData(models));

    const legacyReportIds = [
      districtLegacyReport1.id,
      nationalLegacyReport1.id,
      nationalLegacyReport2.id,
      nationalLegacyReport3.id,
      projectLegacyReport1.id,
    ];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${legacyReportIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /legacyReports/:id', async () => {
    it('Sufficient permissions: Should return requested legacy report that is used in a dashboard item connected to a SUB NATIONAL dashboard, and users have access to the dashboard item', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`legacyReports/${districtLegacyReport1.id}`);

      expect(result.id).to.equal(districtLegacyReport1.id);
    });

    it('Sufficient permissions: Should return requested legacy report that is used in a dashboard item connected to a NATIONAL dashboard, and users have access to the dashboard item', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`legacyReports/${nationalLegacyReport1.id}`);

      expect(result.id).to.equal(nationalLegacyReport1.id);
    });

    it('Sufficient permissions: Should return requested legacy report that is used in a dashboard item connected to a project level dashboard, and users have access to any of the project child countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`legacyReports/${projectLegacyReport1.id}`);

      expect(result.id).to.equal(projectLegacyReport1.id);
    });

    it('Insufficient permissions: Should throw an error when requesting legacy report that is used in a dashboard item connected to a SUB NATIONAL dashboard, and users do not have access', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access districtReport1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`legacyReports/${districtLegacyReport1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting legacy report that is used in a dashboard item connected to a NATIONAL dashboard, and users do not have access', async () => {
      // Remove admin permissions of KI, LA to have insufficient permissions to access nationalReport3.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      await app.grantAccess(policy);
      const { body: result } = await app.get(`legacyReports/${nationalLegacyReport3.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting legacy report that is used in a dashboard item connected to a project level dashboard, and users have access to any of the project child countries', async () => {
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
      const { body: result } = await app.get(`legacyReports/${projectLegacyReport1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /legacyReports', async () => {
    it('Sufficient permissions: Should return all legacy reports that users have access to', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: results } = await app.get(`legacyReports?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtLegacyReport1.id,
        nationalLegacyReport1.id,
        nationalLegacyReport2.id,
        nationalLegacyReport3.id,
        projectLegacyReport1.id,
      ]);
    });

    it('Sufficient permissions: Should return all legacy reports if the user has BES Admin access', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`legacyReports?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtLegacyReport1.id,
        nationalLegacyReport1.id,
        nationalLegacyReport2.id,
        nationalLegacyReport3.id,
        projectLegacyReport1.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if the user has permissions for no legacy reports', async () => {
      const policy = {
        DL: ['Public'],
      };
      await app.grantAccess(policy);
      const { body: results } = await app.get(`legacyReports?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
