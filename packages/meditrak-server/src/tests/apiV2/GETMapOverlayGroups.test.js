/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { addBaselineTestCountries, buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupMapOverlayTestData } from '../testUtilities';

describe('Permissions checker for GETMapOverlayGroups', async () => {
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
  let nationalMapOverlayGroup1;
  let nationalMapOverlayGroup2;
  let projectLevelMapOverlayGroup1;
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
    ({
      nationalMapOverlayGroup1,
      nationalMapOverlayGroup2,
      projectLevelMapOverlayGroup1,
    } = await setupMapOverlayTestData(models));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /mapOverlayGroups/:id', async () => {
    it('Sufficient permissions: Should return a requested map overlay group that users have access to any of its child map overlays', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`mapOverlayGroups/${nationalMapOverlayGroup1.id}`);

      expect(result.id).to.equal(nationalMapOverlayGroup1.id);
    });

    it('Sufficient permissions: Should return a requested project level map overlay group that users have access to any of its child map overlays', async () => {
      await app.grantAccess(DEFAULT_POLICY);
      const { body: result } = await app.get(`mapOverlayGroups/${projectLevelMapOverlayGroup1.id}`);

      expect(result.id).to.equal(projectLevelMapOverlayGroup1.id);
    });

    it('Insufficient permissions: Should throw an error if requesting map overlay group that users do not have access to any of its child map overlays', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: result } = await app.get(`mapOverlayGroups/${nationalMapOverlayGroup1.id}`);

      expect(result).to.have.keys('error');
    });

    it('Insufficient permissions: Should throw an error if requesting project level map overlays that users do not have access to any of its child map overlays', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: result } = await app.get(`mapOverlayGroups/${projectLevelMapOverlayGroup1.id}`);

      expect(result).to.have.keys('error');
    });
  });

  describe('GET /mapOverlayGroups', async () => {
    before(async () => {
      const mapOverlayGroupIds = [
        nationalMapOverlayGroup1.id,
        nationalMapOverlayGroup2.id,
        projectLevelMapOverlayGroup1.id,
      ];
      filterString = `filter={"id":{"comparator":"in","comparisonValue":["${mapOverlayGroupIds.join(
        '","',
      )}"]}}`;
    });

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
      const { body: results } = await app.get(`mapOverlayGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlayGroup1.id,
        projectLevelMapOverlayGroup1.id,
      ]);
    });

    it('Sufficient permissions: Should return the full list of map overlay groups if we have BES admin access', async () => {
      app.grantAccess(BES_ADMIN_POLICY);
      const { body: results } = await app.get(`mapOverlayGroups?${filterString}`);

      expect(results.map(r => r.id)).to.deep.equal([
        nationalMapOverlayGroup1.id,
        nationalMapOverlayGroup2.id,
        projectLevelMapOverlayGroup1.id,
      ]);
    });

    it('Insufficient permissions: Should return an empty array if users do not have access to any of the map overlays used in map overlay groups', async () => {
      const policy = {
        DL: ['Public'],
      };
      app.grantAccess(policy);
      const { body: results } = await app.get(`mapOverlayGroups?${filterString}`);

      expect(results).to.be.empty;
    });
  });
});
