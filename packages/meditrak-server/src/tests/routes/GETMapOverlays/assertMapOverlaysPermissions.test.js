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
  filterMapOverlaysByPermissions,
  assertMapOverlaysPermissions,
} from '../../../routes/GETMapOverlays/assertMapOverlaysPermissions';

describe('Permissions checker for GETMapOverlays', async () => {
  const DEFAULT_POLICY = {
    DL: ['Public'],
    KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
    VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
    LA: ['Admin'],
  };

  const models = getModels();
  let nationalMapOverlay1;
  let nationalMapOverlay2;
  let projectLevelMapOverlay;

  before(async () => {
    //Set up the map overlays
    nationalMapOverlay1 = await findOrCreateDummyRecord(
      models.mapOverlay,
      { id: 'national_map_overlay_1_test' },
      {
        name: `Test national map overlay 1`,
        userGroup: 'Admin',
        countryCodes: ['KI'],
      },
    );
    nationalMapOverlay2 = await findOrCreateDummyRecord(
      models.mapOverlay,
      { id: 'national_map_overlay_2_test' },
      {
        name: `Test national map overlay 2`,
        userGroup: 'Admin',
        countryCodes: ['LA'],
      },
    );
    projectLevelMapOverlay = await findOrCreateDummyRecord(
      models.mapOverlay,
      { id: 'project_level_map_overlay_3_test' },
      {
        name: `Test project level map overlay 3`,
        userGroup: 'Admin',
        countryCodes: ['unfpa'],
      },
    );
  });

  describe('filterMapOverlaysByPermissions()', async () => {
    it('Sufficient permissions: Should return all the map overlays that users do not have access to their countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
      ]);

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(nationalMapOverlay1);
      expect(result[1]).to.equal(nationalMapOverlay2);
    });

    it('Sufficient permissions: Should return all the project level map overlays that users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(result.length).to.equal(2);
      expect(result[0]).to.equal(nationalMapOverlay2);
      expect(result[1]).to.equal(projectLevelMapOverlay);
    });

    it('Insufficient permissions: Should filter out any map overlays that users do not have access to their countries', async () => {
      //Remove the permission of VU to have insufficient permissions to access nationalMapOverlay2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
      ]);

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(nationalMapOverlay1);
    });

    it('Insufficient permissions: Should filter out any project level map overlays that users do not have access to any of their child countries', async () => {
      //Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level map overlay.
      const policy = {
        DL: ['Public'],
        // KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        // VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: ['Admin'],
        // TO: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const result = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(result.length).to.equal(1);
      expect(result[0]).to.equal(nationalMapOverlay2);
    });
  });

  describe('assertMapOverlaysPermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to all the map overlays', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertMapOverlaysPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
      ]);

      expect(result).to.true;
    });

    it('Sufficient permissions: Should return true if the map overlays are project level and users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const result = await assertMapOverlaysPermissions(accessPolicy, models, [
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(result).to.true;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the countries of the map overlays', async () => {
      //Remove the permission of LA to have insufficient permissions to access nationalMapOverlay2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        // LA: ['Admin'],
      };
      const accessPolicy = new AccessPolicy(policy);

      expect(() =>
        assertMapOverlaysPermissions(accessPolicy, models, [
          nationalMapOverlay1,
          nationalMapOverlay2,
        ]),
      ).to.throw;
    });

    it('Insufficient permissions: Should throw an exception if the map overlays are project level and users do not have access to any of their child countries', async () => {
      //Remove Admin permission of TO to have insufficient permissions to access the project level map overlay.
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
        assertMapOverlaysPermissions(accessPolicy, models, [
          nationalMapOverlay2,
          projectLevelMapOverlay,
        ]),
      ).to.throw;
    });
  });
});
