/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { expect } from 'chai';
import { addBaselineTestCountries, buildAndInsertProjectsAndHierarchies } from '@tupaia/database';
import { BES_ADMIN_PERMISSION_GROUP } from '../../permissions';
import { TestableApp, setupMapOverlayTestData } from '../testUtilities';

describe('Permissions checker for GETMapOverlayGroupRelations', async () => {
  const BES_ADMIN_POLICY = {
    LA: [BES_ADMIN_PERMISSION_GROUP],
  };

  const app = new TestableApp();
  const { models } = app;
  let nationalMapOverlayGroupRelation1;
  let nationalMapOverlay2;

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
    ({ nationalMapOverlayGroupRelation1, nationalMapOverlay2 } = await setupMapOverlayTestData(
      models,
    ));
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('Edit /mapOverlayGroupRelations/:id', async () => {
    it('successfully processes the request', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      const { body: result } = await app.put(
        `mapOverlayGroupRelations/${nationalMapOverlayGroupRelation1.id}`,
        {
          body: { child_id: nationalMapOverlay2.id },
        },
      );
      expect(result.message).to.equal('Successfully updated mapOverlayGroupRelations');
    });

    it('updates the child_id in map_overlay_relation table', async () => {
      await app.grantAccess(BES_ADMIN_POLICY);
      await app.put(`mapOverlayGroupRelations/${nationalMapOverlayGroupRelation1.id}`, {
        body: { child_id: nationalMapOverlay2.id },
      });

      const updatedRecord = await models.mapOverlayGroupRelation.findOne({
        id: nationalMapOverlayGroupRelation1.id,
      });
      expect(updatedRecord.child_id).to.equal(nationalMapOverlay2.id);
    });
  });
});
