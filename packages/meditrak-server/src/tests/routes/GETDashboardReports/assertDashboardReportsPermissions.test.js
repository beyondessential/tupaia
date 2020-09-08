/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import { findOrCreateDummyRecord } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../getModels';
import {
  filterDashboardReportsByPermissions,
  assertDashboardReportsPermissions,
} from '../../../routes/GETDashboardReports/assertDashboardReportsPermissions';

describe('Permissions checker for GETDashboardReports', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const models = getModels();
  let nationalReport1;
  let nationalReport2;
  let nationalReport3;
  let projectLevelDashboard;

  before(async () => {
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

    //Set up the dashboard groups
    await findOrCreateDummyRecord(
      models.dashboardGroup,
      {
        code: 'test_report_national_dashboard_group_1',
      },
      {
        id: 7777777,
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
        code: 'test_report_national_dashboard_group_2',
      },
      {
        id: 8888888,
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
      { code: 'test_report_project_level_dashboard_group_3' },
      {
        id: 9999999,
        name: 'Test project level dashboard group 3',
        userGroup: 'Admin',
        organisationUnitCode: 'unfpa',
        organisationLevel: 'Project',
        projectCodes: ['unfpa'],
        dashboardReports: [projectLevelDashboard.id],
      },
    );
  });

  describe('filterDashboardReportsByPermissions()', async () => {
    it('Sufficient permissions: Should return dashboard reports contained in dashboard groups that users have access to their countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await filterDashboardReportsByPermissions(accessPolicy, models, [
        nationalReport1,
        nationalReport2,
        nationalReport3,
      ]);

      expect(result.length).to.equal(3);
      expect(result[0]).to.equal(nationalReport1);
      expect(result[1]).to.equal(nationalReport2);
      expect(result[2]).to.equal(nationalReport3);
    });

    it('Sufficient permissions: Should return dashboard reports contained in project level dashboard groups that users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await filterDashboardReportsByPermissions(accessPolicy, models, [
        nationalReport3,
        projectLevelDashboard,
      ]);

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(nationalReport3);
      expect(result[1]).to.equal(projectLevelDashboard);
    });

    it('Insufficient permissions: Should filter out any dashboard reports contained in dashboard groups that users do not have access', async () => {
      //Remove the permission of LA to have insufficient permissions to access nationalReport3.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterDashboardReportsByPermissions(accessPolicy, models, [
        nationalReport1,
        nationalReport2,
        nationalReport3,
      ]);

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(nationalReport1);
      expect(result[1]).to.equal(nationalReport2);
    });

    it('Insufficient permissions: Should filter out any dashboard reports contained in project level dashboard groups that users have access to any of their child countries', async () => {
      //Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level dashboard group.
      const policy = {
        DL: ['Public'],
        // KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        // VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        //   TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterDashboardReportsByPermissions(accessPolicy, models, [
        nationalReport3,
        projectLevelDashboard,
      ]);

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(nationalReport3);
    });
  });

  describe('assertDashboardReportsPermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to all the countries of the dashboard groups that contain the dashboard reports', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertDashboardReportsPermissions(accessPolicy, models, [
        nationalReport1,
        nationalReport2,
        nationalReport3,
      ]);

      expect(result).to.true;
    });

    it("Sufficient permissions: Should return true if the reports' dashboard groups are project level and users have access to any of their child countries", async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertDashboardReportsPermissions(accessPolicy, models, [
        nationalReport3,
        projectLevelDashboard,
      ]);
      expect(result).to.true;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the dashboard groups that contain the dashboard reports', async () => {
      //Remove the permission of LA to have insufficient permissions to access nationalReport3.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertDashboardReportsPermissions(accessPolicy, models, [
          nationalReport1,
          nationalReport2,
          nationalReport3,
        ]),
      ).to.throw;
    });

    it("Insufficient permissions: Should throw an exception if the reports' dashboard groups are project level and users do not have access to any of their child countries", async () => {
      //Remove Admin permission of TO, VU, SB, KI to have insufficient permissions to access the project level dashboard groups.
      const policy = {
        DL: ['Public'],
        // KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        // VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        // TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertDashboardReportsPermissions(accessPolicy, models, [
          nationalReport3,
          projectLevelDashboard,
        ]),
      ).to.throw;
    });
  });
});
