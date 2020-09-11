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

  const BES_ADMIN_POLICY = {
    LA: ['BES Admin'],
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
    it('Sufficient permissions: Should return all the map overlays that users have access to their countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlay1.id,
        nationalMapOverlay2.id,
      ]);
    });

    it('Sufficient permissions: Should return all the project level map overlays that users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlay2.id,
        projectLevelMapOverlay.id,
      ]);
    });

    it('Sufficient permissions: Should always return all map overlays if users have BES Admin access to any countries', async () => {
      const accessPolicy = new AccessPolicy(BES_ADMIN_POLICY);
      const results = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlay1.id,
        nationalMapOverlay2.id,
        projectLevelMapOverlay.id,
      ]);
    });

    it('Insufficient permissions: Should filter out any map overlays that users do not have access to their countries', async () => {
      //Remove the permission of VU to have insufficient permissions to access nationalMapOverlay2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: [/*'Admin'*/ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalMapOverlay1.id]);
    });

    it('Insufficient permissions: Should filter out any project level map overlays that users do not have access to any of their child countries', async () => {
      //Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level map overlay.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Public'],
        LA: ['Admin'],
        TO: [/*'Admin'*/ 'Public'],
      };
      const accessPolicy = new AccessPolicy(policy);
      const results = await filterMapOverlaysByPermissions(accessPolicy, models, [
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(results.map(r => r.id)).to.deep.equal([nationalMapOverlay2.id]);
    });
  });

  describe('assertMapOverlaysPermissions()', async () => {
    it('Sufficient permissions: Should return true if users have access to all the map overlays', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await assertMapOverlaysPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
      ]);

      expect(results).to.true;
    });

    it('Sufficient permissions: Should return true if the map overlays are project level and users have access to any of their child countries', async () => {
      const accessPolicy = new AccessPolicy(DEFAULT_POLICY);
      const results = await assertMapOverlaysPermissions(accessPolicy, models, [
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(results).to.true;
    });

    it('Sufficient permissions: Should always return true if users have BES Admin access to any countries', async () => {
      const accessPolicy = new AccessPolicy(BES_ADMIN_POLICY);
      const results = await assertMapOverlaysPermissions(accessPolicy, models, [
        nationalMapOverlay1,
        nationalMapOverlay2,
        projectLevelMapOverlay,
      ]);

      expect(results).to.true;
    });

    it('Insufficient permissions: Should throw an exception if users do not have access to any of the countries of the map overlays', async () => {
      //Remove the permission of LA to have insufficient permissions to access nationalMapOverlay2.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        LA: [/*'Admin'*/ 'Public'],
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
      //Remove Admin permission of TO, KI, SB, VU to have insufficient permissions to access the project level map overlay.
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Public'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, /*'Admin'*/ 'Public'],
        LA: ['Admin'],
        TO: [/*'Admin'*/ 'Public'],
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
