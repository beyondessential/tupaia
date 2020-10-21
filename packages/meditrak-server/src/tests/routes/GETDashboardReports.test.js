/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertProjectsAndHierarchies,
} from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../TestableApp';
import { prepareStubAndAuthenticate } from './utilities/prepareStubAndAuthenticate';

describe('Permissions checker for GETDashboardReports', async () => {
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
  let districtReport1;
  let nationalReport1;
  let nationalReport2;
  let nationalReport3;
  let projectLevelDashboard;

  before(async () => {
    // Still create these existing entities just in case test database for some reasons do not have these records.
    await findOrCreateDummyRecord(models.entity, {
      code: 'KI_BIKUC04',
      type: 'facility',
      country_code: 'KI',
    });
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

    // Set up dashboard reports
    districtReport1 = await findOrCreateDummyRecord(
      models.dashboardReport,
      { id: 'district_dashboard_report_1_test' },
      {
        dataBuilder: 'sampleDataBuilder',
        dataBuilderConfig: '{}',
        viewJson: '{}',
        dataServices: '[{"isDataRegional": true}]',
      },
    );
    nationalReport1 = await findOrCreateDummyRecord(
      models.dashboardReport,
      { id: 'national_dashboard_report_1_test' },
      {
        dataBuilder: 'sampleDataBuilder',
        dataBuilderConfig: '{}',
        viewJson: '{}',
        dataServices: '[{"isDataRegional": true}]',
      },
    );
    nationalReport2 = await findOrCreateDummyRecord(
      models.dashboardReport,
      { id: 'national_dashboard_report_2_test' },
      {
        dataBuilder: 'sampleDataBuilder',
        dataBuilderConfig: '{}',
        viewJson: '{}',
        dataServices: '[{"isDataRegional": true}]',
      },
    );
    nationalReport3 = await findOrCreateDummyRecord(
      models.dashboardReport,
      { id: 'national_dashboard_report_3_test' },
      {
        dataBuilder: 'sampleDataBuilder',
        dataBuilderConfig: '{}',
        viewJson: '{}',
        dataServices: '[{"isDataRegional": true}]',
      },
    );
    projectLevelDashboard = await findOrCreateDummyRecord(
      models.dashboardReport,
      { id: 'project_level_dashboard_report_4_test' },
      {
        dataBuilder: 'sampleDataBuilder',
        dataBuilderConfig: '{}',
        viewJson: '{}',
        dataServices: '[{"isDataRegional": true}]',
      },
    );

    // Set up the dashboard groups
    await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'report_district_dashboard_group_1_test' },
      {
        id: 8888888,
        name: 'Test district dashboard group 1',
        userGroup: 'Admin',
        organisationUnitCode: 'KI_Phoenix Islands',
        organisationLevel: 'District',
        projectCodes: ['explore'],
        dashboardReports: [districtReport1.id],
      },
    );
    await findOrCreateDummyRecord(
      models.dashboardGroup,
      {
        code: 'report_national_dashboard_group_1_test',
      },
      {
        id: 9999999,
        name: 'Test national dashboard group 1',
        userGroup: 'Admin',
        organisationUnitCode: 'KI',
        organisationLevel: 'Country',
        projectCodes: ['explore'],
        dashboardReports: [nationalReport1.id, nationalReport2.id],
      },
    );
    await findOrCreateDummyRecord(
      models.dashboardGroup,
      {
        code: 'report_national_dashboard_group_2_test',
      },
      {
        id: 1212121,
        name: 'Test national dashboard group 2',
        userGroup: 'Admin',
        organisationUnitCode: 'LA',
        organisationLevel: 'Country',
        projectCodes: ['explore'],
        dashboardReports: [nationalReport3.id],
      },
    );
    await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'report_project_level_dashboard_group_3_test' },
      {
        id: 2323232,
        name: 'Test project level dashboard group 3',
        userGroup: 'Admin',
        organisationUnitCode: 'test_project',
        organisationLevel: 'Project',
        projectCodes: ['test_project'],
        dashboardReports: [projectLevelDashboard.id],
      },
    );
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /dashboardReports/:id', async () => {
    it('Sufficient permissions: Should return requested dashboard reports contained in SUB NATIONAL dashboard groups that users have access to their countries', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardReports/${districtReport1.id}`);

      expect(result.id).to.equal(districtReport1.id);
    });

    it('Sufficient permissions: Should return requested dashboard reports contained in NATIONAL dashboard groups that users have access to their countries', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardReports/${nationalReport1.id}`);

      expect(result.id).to.equal(nationalReport1.id);
    });

    it('Sufficient permissions: Should return requested dashboard reports contained in project level dashboard groups that users have access to any of their child countries', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardReports/${projectLevelDashboard.id}`);

      expect(result.id).to.equal(projectLevelDashboard.id);
    });

    it('Insufficient permissions: Should throw an error when requesting dashboard reports contained in SUB NATIONAL dashboard groups that users do not have access', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access districtReport1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        TO: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`dashboardReports/${districtReport1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting dashboard reports contained in NATIONAL dashboard groups that users do not have access', async () => {
      // Remove the permission of LA to have insufficient permissions to access nationalReport3.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`dashboardReports/${nationalReport3.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error when requesting dashboard reports contained in project level dashboard groups that users have access to any of their child countries', async () => {
      // Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level dashboard group.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        LA: ['Admin'],
        TO: [/* 'Admin' */ 'Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`dashboardReports/${projectLevelDashboard.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dashboardReports', async () => {
    it('Sufficient permissions: Should return all dashboard reports that users have access to', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: results } = await app.get(`dashboardReports`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtReport1.id,
        nationalReport1.id,
        nationalReport2.id,
        nationalReport3.id,
        projectLevelDashboard.id,
      ]);
    });

    it('Sufficient permissions: Should return all dashboard reports if the user has BES Admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dashboardReports`);

      expect(results.map(r => r.id)).to.deep.equal([
        districtReport1.id,
        nationalReport1.id,
        nationalReport2.id,
        nationalReport3.id,
        projectLevelDashboard.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if the user has permissions for no dashboard reports', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`dashboardReports`);

      expect(results).to.be.empty;
    });
  });
});
