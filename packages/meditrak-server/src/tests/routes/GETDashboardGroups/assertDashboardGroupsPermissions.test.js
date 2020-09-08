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
  let nationalDashboardGroup1;
  let nationalDashboardGroup2;
  let projectLevelDashboardGroup;

  before(async () => {
    //Set up the dashboard groups
    nationalDashboardGroup1 = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'test_national_dashboard_group_1' },
      {
        id: 1111111,
        name: 'Test dashboard group 1',
        userGroup: 'Admin',
        organisationUnitCode: 'KI',
        organisationLevel: 'Country',
        projectCodes: ['explore'],
        dashboardReports: [],
      },
    );
    nationalDashboardGroup2 = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'test_national_dashboard_group_2' },
      {
        id: 2222222,
        name: 'Test dashboard group 2',
        userGroup: 'Admin',
        organisationUnitCode: 'LA',
        organisationLevel: 'Country',
        projectCodes: ['explore'],
        dashboardReports: [],
      },
    );
    projectLevelDashboardGroup = await findOrCreateDummyRecord(
      models.dashboardGroup,
      { code: 'test_project_level_dashboard_group_3' },
      {
        id: 3333333,
        name: 'Test dashboard group 3',
        userGroup: 'Admin',
        organisationUnitCode: 'unfpa',
        organisationLevel: 'Project',
        projectCodes: ['unfpa'],
        dashboardReports: [],
      },
    );
  });

  describe('filterDashboardGroupsByPermissions()', async () => {
    it('Sufficient permissions: Should return dashboard groups that users have access to their countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup1,
        nationalDashboardGroup2,
      ]);

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(nationalDashboardGroup1);
      expect(result[1]).to.equal(nationalDashboardGroup2);
    });

    it('Sufficient permissions: Should return project level dashboard groups that users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup2,
        projectLevelDashboardGroup,
      ]);

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(nationalDashboardGroup2);
      expect(result[1]).to.equal(projectLevelDashboardGroup);
    });

    it('Insufficient permissions: Should filter out any dashboard groups that users do not have access to their countries', async () => {
      //Remove the permission of LA to have insufficient permissions to access nationalDashboardGroup2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
        TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup1,
        nationalDashboardGroup2,
      ]);

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(nationalDashboardGroup1);
    });

    it('Insufficient permissions: Should filter out any project level dashboard groups that users have access to any of their child countries', async () => {
      //Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level dashboard group.
      const policy = {
        DL: ['Public'],
        // KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        // VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        // TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterDashboardGroupsByPermissions(accessPolicy, models, [
        nationalDashboardGroup2,
        projectLevelDashboardGroup,
      ]);

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(nationalDashboardGroup2);
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

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the dashboard groups', async () => {
      //Remove the Admin permission of LA to have insufficient permissions to access nationalDashboardGroup2.
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
        // KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        // VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        //   TO: ['Admin'],
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
