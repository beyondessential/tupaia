/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import {
  findOrCreateDummyRecord,
  buildAndInsertProjectsAndHierarchies,
  addBaselineTestCountries,
} from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../TestableApp';
import { prepareStubAndAuthenticate } from './utilities/prepareStubAndAuthenticate';

describe('Permissions checker for GETDashboardGroups', async () => {
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
  let facilityDashboardGroup1;
  let districtDashboardGroup1;
  let nationalDashboardGroup1;
  let nationalDashboardGroup2;
  let projectLevelDashboardGroup;

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

    // Set up the dashboard groups
    facilityDashboardGroup1 = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'facility_dashboard_group_1_test' },
      {
        id: 1111111,
        name: 'Test facility dashboard group 1',
        userGroup: 'Admin',
        organisationUnitCode: 'KI_BIKUC04',
        organisationLevel: 'Facility',
        projectCodes: ['explore'],
        dashboardReports: [],
      },
    );
    districtDashboardGroup1 = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'district_dashboard_group_1_test' },
      {
        id: 2222222,
        name: 'Test district dashboard group 1',
        userGroup: 'Admin',
        organisationUnitCode: 'KI_Phoenix Islands',
        organisationLevel: 'District',
        projectCodes: ['explore'],
        dashboardReports: [],
      },
    );
    nationalDashboardGroup1 = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'national_dashboard_group_1_test' },
      {
        id: 3333333,
        name: 'Test national dashboard group 1',
        userGroup: 'Admin',
        organisationUnitCode: 'KI',
        organisationLevel: 'Country',
        projectCodes: ['explore'],
        dashboardReports: [],
      },
    );
    nationalDashboardGroup2 = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'national_dashboard_group_2_test' },
      {
        id: 4444444,
        name: 'Test national dashboard group 2',
        userGroup: 'Admin',
        organisationUnitCode: 'LA',
        organisationLevel: 'Country',
        projectCodes: ['explore'],
        dashboardReports: [],
      },
    );
    projectLevelDashboardGroup = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'project_level_dashboard_group_3_test' },
      {
        id: 5555555,
        name: 'Test project level dashboard group 3',
        userGroup: 'Admin',
        organisationUnitCode: 'test_project',
        organisationLevel: 'Project',
        projectCodes: ['test_project'],
        dashboardReports: [],
      },
    );
  });

  afterEach(() => {
    Authenticator.prototype.getAccessPolicyForUser.restore();
  });

  describe('GET /dashboardGroups/:id', async () => {
    it('Sufficient permissions: Should return a requested dashboard group if users have access to the country of the dashboard group', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardGroups/${nationalDashboardGroup1.id}`);

      expect(result.id).to.equal(nationalDashboardGroup1.id);
    });

    it('Sufficient permissions: Should return a requested project level dashboard group if users have access to any of their child countries', async () => {
      await prepareStubAndAuthenticate(app, DEFAULT_POLICY);
      const { body: result } = await app.get(`dashboardGroups/${projectLevelDashboardGroup.id}`);

      expect(result.id).to.equal(projectLevelDashboardGroup.id);
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to the requested dashboard group', async () => {
      // Remove Admin permission of KI to have insufficient permissions to access facilityDashboardGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin', 'Public'],
        TO: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`dashboardGroups/${facilityDashboardGroup1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an exception if dashboard groups are project level and users do not have access to any of their child countries', async () => {
      // Remove Admin permission of TO, SB, KI, VU to have insufficient permissions to access the project level dashboard groups.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */, 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /* 'Admin' */, 'Public'],
        LA: [/* 'Admin' */ 'Public'],
        TO: [/* 'Admin' */ 'Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: result } = await app.get(`dashboardGroups/${projectLevelDashboardGroup.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /dashboardGroups', async () => {
    it('Sufficient permissions: Return only the list of entries we have permissions for', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin', */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        TO: ['Admin'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`dashboardGroups`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardGroup2.id,
        projectLevelDashboardGroup.id,
      ]);
    });

    it('Sufficient permissions: Should return the full list of dashboard groups if we have BES Admin access', async () => {
      await prepareStubAndAuthenticate(app, BES_ADMIN_POLICY);
      const { body: results } = await app.get(`dashboardGroups`);

      expect(results.map(r => r.id)).to.deep.equal([
        facilityDashboardGroup1.id,
        districtDashboardGroup1.id,
        nationalDashboardGroup1.id,
        nationalDashboardGroup2.id,
        projectLevelDashboardGroup.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if we have permissions for no dashboard groups', async () => {
      const policy = {
        DL: ['Public'],
      };
      await prepareStubAndAuthenticate(app, policy);
      const { body: results } = await app.get(`dashboardGroups`);

      expect(results).to.be.empty;
    });
  });
});
