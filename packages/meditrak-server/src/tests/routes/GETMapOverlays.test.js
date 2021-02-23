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
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp } from '../testUtilities';

describe('Permissions checker for GETMapOverlays', async () => {
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

  const app = new TestableApp();
  const { models } = app;
  let nationalMapOverlay1;
  let nationalMapOverlay2;
  let projectLevelMapOverlay;
  let filterString;

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
    // Set up the map overlays
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
        countryCodes: ['test_project'],
      },
    );

    const mapOverlayIds = [
      nationalMapOverlay1.id,
      nationalMapOverlay2.id,
      projectLevelMapOverlay.id,
    ];
    filterString = `filter={"id":{"comparator":"in","comparisonValue":["${mapOverlayIds.join(
      '","',
    )}"]}}`;
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /mapOverlays/:id', async () => {
    it('Sufficient permissions: Should return a requested map overlay that users have access to their countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`mapOverlays/${nationalMapOverlay1.id}`);

      expect(result.id).to.equal(nationalMapOverlay1.id);
    });

    it('Sufficient permissions: Should return a requested project level map overlay that users have access to any of their child countries', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`mapOverlays/${projectLevelMapOverlay.id}`);

      expect(result.id).to.equal(projectLevelMapOverlay.id);
    });

    it('Insufficient permissions: Should throw an error if requesting map overlay that users do not have access to their countries', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: result } = await app.get(`mapOverlays/${nationalMapOverlay1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error if requesting project level map overlays that users do not have access to any of their child countries', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: result } = await app.get(`mapOverlays/${projectLevelMapOverlay.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /mapOverlays', async () => {
    it('Sufficient permissions: Return only the list of entries we have permission for', async () => {
      const policy = {
        DL: ['Public'],
        KI: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        SB: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Royal Australasian College of Surgeons'],
        VU: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Admin'],
        /* LA: ['Admin'], */
        TO: ['Admin'],
      };
      app.grantAccess(policy);
      const { body: results } = await app.get(`mapOverlays?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlay1.id,
        projectLevelMapOverlay.id,
      ]);
    });

    it('Sufficient permissions: Should return the full list of map overlays if we have BES admin access', async () => {
      app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`mapOverlays?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlay1.id,
        nationalMapOverlay2.id,
        projectLevelMapOverlay.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if users do not have access to any of the countries of the map overlays', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: results } = await app.get(`mapOverlays?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
