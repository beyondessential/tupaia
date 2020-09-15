/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import {
  findOrCreateDummyRecord,
  buildAndInsertProjectsAndHierarchies,
  findOrCreateDummyCountryEntity,
} from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { getModels } from '../../getModels';
import {
  filterDashboardGroupsByPermissions,
  assertDashboardGroupsPermissions,
} from '../../../routes/GETDashboardGroups/assertDashboardGroupsPermissions';

describe('Permissions checker for GETDashboardGroups', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
    TO: ['Admin'],
  };

  const models = getModels();
  let facilityDashboardGroup1;
  let districtDashboardGroup1;
  let nationalDashboardGroup1;
  let nationalDashboardGroup2;
  let projectLevelDashboardGroup;

  before(async () => {
    //Still create these existing entities just in case test database for some reasons do not have these records.
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
    await findOrCreateDummyCountryEntity(models, {
      code: 'KI',
      name: 'Kiribati',
    });
    await findOrCreateDummyCountryEntity(models, {
      code: 'LA',
      name: 'Laos',
    });
    await findOrCreateDummyCountryEntity(models, {
      code: 'SB',
      name: 'Solomon Islands',
    });
    await findOrCreateDummyCountryEntity(models, {
      code: 'VU',
      name: 'Vanuatu',
    });
    await findOrCreateDummyCountryEntity(models, {
      code: 'TO',
      name: 'Tonga',
    });
    await buildAndInsertProjectsAndHierarchies(models, [
      {
        code: 'test_project',
        name: 'Test Project',
        entities: [{ code: 'KI' }, { code: 'VU' }, { code: 'TO' }, { code: 'SB' }],
      },
    ]);

    //Set up the dashboard groups
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

  describe('filterDashboardGroupsByPermissions()', async () => {
    it("Sufficient permissions: Should return sub national level dashboard groups that users have access to their entities' countries", async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        facilityDashboardGroup1,
        districtDashboardGroup1,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        facilityDashboardGroup1.id,
        districtDashboardGroup1.id,
      ]);
    });

    it('Sufficient permissions: Should return national dashboard groups that users have access to their countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup1,
        nationalDashboardGroup2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardGroup1.id,
        nationalDashboardGroup2.id,
      ]);
    });

    it('Sufficient permissions: Should return project level dashboard groups that users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup2,
        projectLevelDashboardGroup,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalDashboardGroup2.id,
        projectLevelDashboardGroup.id,
      ]);
    });

    it('Insufficient permissions: Should filter out any sub national dashboard groups that users do not have access to their entities', async () => {
      //Remove Admin permission of KI to have insufficient permissions to access facilityDashboardGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin', 'Public'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        facilityDashboardGroup1,
        nationalDashboardGroup2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalDashboardGroup2.id]);
    });

    it('Insufficient permissions: Should filter out any dashboard groups that users do not have access to their countries', async () => {
      //Remove Admin permission of LA to have insufficient permissions to access nationalDashboardGroup2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: [/*'Admin'*/ 'Public'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup1,
        nationalDashboardGroup2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalDashboardGroup1.id]);
    });

    it('Insufficient permissions: Should filter out any project level dashboard groups that users have access to any of their child countries', async () => {
      //Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level dashboard group.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/, 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/, 'Public'],
        LA: ['Admin', 'Public'],
        TO: [/*'Admin'*/ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup2,
        projectLevelDashboardGroup,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalDashboardGroup2.id]);
    });
  });

  describe('assertDashboardGroupsPermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to all the countries of the dashboard groups', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertDashboardGroupsPermissions(accessPolicy, models, [
        nationalDashboardGroup1,
        nationalDashboardGroup2,
      ]);

      expect(result).to.true;
    });

    it('Sufficient permissions: Should return true if dashboard groups are project level and users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertDashboardGroupsPermissions(accessPolicy, models, [
        nationalDashboardGroup2,
        projectLevelDashboardGroup,
      ]);
      expect(result).to.true;
    });

    it("Insufficient permissions: Should filter out any sub national dashboard groups that users do not have access to their entities' countries", async () => {
      //Remove Admin permission of KI to have insufficient permissions to access facilityDashboardGroup1.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin', 'Public'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertDashboardGroupsPermissions(accessPolicy, models, [
          facilityDashboardGroup1,
          nationalDashboardGroup2,
        ]),
      ).to.throw;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the dashboard groups', async () => {
      //Remove the Admin permission of LA to have insufficient permissions to access nationalDashboardGroup2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: [/*'Admin'*/ 'Public'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertDashboardGroupsPermissions(accessPolicy, models, [
          nationalDashboardGroup1,
          nationalDashboardGroup2,
        ]),
      ).to.throw;
    });

    it('Insufficient permissions: Should throw an exception if dashboard groups are project level and users do not have access to any of their child countries', async () => {
      //Remove Admin permission of TO, SB, KI, VU to have insufficient permissions to access the project level dashboard groups.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/, 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP /*'Admin'*/, 'Public'],
        LA: [/*'Admin'*/ 'Public'],
        TO: [/*'Admin'*/ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertDashboardGroupsPermissions(accessPolicy, models, [
          nationalDashboardGroup2,
          projectLevelDashboardGroup,
        ]),
      ).to.throw;
    });
  });
});
