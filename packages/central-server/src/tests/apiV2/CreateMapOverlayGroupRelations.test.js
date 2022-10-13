/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { addBaselineTestCountries, buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupMapOverlayTestData } from '../testUtilities';

describe('CreateMapOverlayGroupRelations', async () => {
  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let nationalMapOverlayGroupRelation1;
  let nationalMapOverlay2;
  let nationalMapOverlayGroup1;

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
    ({ nationalMapOverlay2, nationalMapOverlayGroup1 } = await setupMapOverlayTestData(models));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('Create /mapOverlayGroupRelations/', async () => {
    it('successfully processes the request', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.post('mapOverlayGroupRelations/', {
        body: {
          child_id: nationalMapOverlay2.id,
          map_overlay_group_id: nationalMapOverlayGroup1.id,
          sort_order: 0,
        },
      });

      expect(result.message).to.equal('Successfully created mapOverlayGroupRelations');
    });

    it('creates a new record', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.post('mapOverlayGroupRelations/', {
        body: {
          child_id: nationalMapOverlay2.id,
          map_overlay_group_id: nationalMapOverlayGroup1.id,
          sort_order: 0,
        },
      });

      const updatedRecord = await models.mapOverlayGroupRelation.findOne({
        child_id: nationalMapOverlay2.id,
        map_overlay_group_id: nationalMapOverlayGroup1.id,
        sort_order: 0,
      });
      expect(updatedRecord.child_id).to.equal(nationalMapOverlay2.id);
    });
  });
});
