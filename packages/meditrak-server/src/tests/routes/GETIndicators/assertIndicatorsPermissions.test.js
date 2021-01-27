/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { AccessPolicy } from '@tupaia/access-policy';
import {
  findOrCreateDummyRecord,
  addBaselineTestCountries,
  buildAndInsertProjectsAndHierarchies,
} from '@tupaia/database';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  BES_ADMIN_PERMISSION_GROUP,
} from '../../../permissions';
import { getModels } from '../../getModels';
import {
  filterIndicatorsByPermissions,
  assertIndicatorsPermissions,
} from '../../../routes/GETIndicators/assertIndicatorsPermissions';

xdescribe('Permissions checker for GETIndicators', async () => {
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

  const models = getModels();
  let nationalIndicator1;
  let nationalIndicator2;
  let projectLevelIndicator;

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
    // Set up the indicators
    nationalIndicator1 = await findOrCreateDummyRecord(
      models.indicator,
      { id: 'national_indicator_1_test' },
      {
        name: `Test national indicator 1`,
        userGroup: 'Admin',
        countryCodes: ['KI'],
      },
    );
    nationalIndicator2 = await findOrCreateDummyRecord(
      models.indicator,
      { id: 'national_indicator_2_test' },
      {
        name: `Test national indicator 2`,
        userGroup: 'Admin',
        countryCodes: ['LA'],
      },
    );
    projectLevelIndicator = await findOrCreateDummyRecord(
      models.indicator,
      { id: 'project_level_indicator_3_test' },
      {
        name: `Test project level indicator 3`,
        userGroup: 'Admin',
        countryCodes: ['test_project'],
      },
    );
  });

  describe('filterIndicatorsByPermissions()', async () => {
    it('Sufficient permissions: Should return all the indicators that users have access to their countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterIndicatorsByPermissions(accessPolicy, models, [
        nationalIndicator1,
        nationalIndicator2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalIndicator1.id, nationalIndicator2.id]);
    });

    it('Sufficient permissions: Should return all the project level indicators that users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterIndicatorsByPermissions(accessPolicy, models, [
        nationalIndicator2,
        projectLevelIndicator,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalIndicator2.id,
        projectLevelIndicator.id,
      ]);
    });

    it('Sufficient permissions: Should always return all indicators if users have BES Admin access to any countries', async () => {
      const accessPolicy = new AccessPolicy(BES_ADMIN_POLICY);
      const results = await filterIndicatorsByPermissions(accessPolicy, models, [
        nationalIndicator1,
        nationalIndicator2,
        projectLevelIndicator,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalIndicator1.id,
        nationalIndicator2.id,
        projectLevelIndicator.id,
      ]);
    });

    it('Insufficient permissions: Should filter out any indicators that users do not have access to their countries', async () => {
      // Remove the permission of VU to have insufficient permissions to access nationalIndicator2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: [/* 'Admin' */ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterIndicatorsByPermissions(accessPolicy, models, [
        nationalIndicator1,
        nationalIndicator2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalIndicator1.id]);
    });

    it('Insufficient permissions: Should filter out any project level indicators that users do not have access to any of their child countries', async () => {
      // Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level indicator.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        LA: ['Admin'],
        TO: [/* 'Admin' */ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterIndicatorsByPermissions(accessPolicy, models, [
        nationalIndicator2,
        projectLevelIndicator,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalIndicator2.id]);
    });
  });

  describe('assertIndicatorsPermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to all the indicators', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await assertIndicatorsPermissions(accessPolicy, models, [
        nationalIndicator1,
        nationalIndicator2,
      ]);

      expect(results).to.true;
    });

    it('Sufficient permissions: Should return true if the indicators are project level and users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await assertIndicatorsPermissions(accessPolicy, models, [
        nationalIndicator2,
        projectLevelIndicator,
      ]);

      expect(results).to.true;
    });

    it('Sufficient permissions: Should always return true if users have BES Admin access to any countries', async () => {
      const accessPolicy = new AccessPolicy(BES_ADMIN_POLICY);
      const results = await assertIndicatorsPermissions(accessPolicy, models, [
        nationalIndicator1,
        nationalIndicator2,
        projectLevelIndicator,
      ]);

      expect(results).to.true;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the countries of the indicators', async () => {
      // Remove the permission of LA to have insufficient permissions to access nationalIndicator2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: [/* 'Admin' */ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertIndicatorsPermissions(accessPolicy, models, [nationalIndicator1, nationalIndicator2]),
      ).to.throw;
    });

    it('Insufficient permissions: Should throw an exception if the indicators are project level and users do not have access to any of their child countries', async () => {
      // Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level indicator.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /* 'Admin' */ 'Public'],
        LA: ['Admin'],
        TO: [/* 'Admin' */ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertIndicatorsPermissions(accessPolicy, models, [
          nationalIndicator2,
          projectLevelIndicator,
        ]),
      ).to.throw;
    });
  });
});
