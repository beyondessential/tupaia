import { setupTest } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;

import { expectError, expectSuccess, resetTestData, TestableApp } from '../../testUtilities';
import { findTestRecordByCode, TEST_SETUP } from './mapOverlayVisualisations.fixtures';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../../permissions';

describe('GET map overlay visualisations', () => {
  const app = new TestableApp();
  const { models } = app;

  const modernMapOverlay = findTestRecordByCode('mapOverlay', 'Modern_Map_Overlay');
  const modernReport = findTestRecordByCode('report', 'Modern_Report');

  const policy = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, VIZ_BUILDER_PERMISSION_GROUP],
  };

  const publicPolicy = {
    DL: ['Public', VIZ_BUILDER_PERMISSION_GROUP],
  };

  // const besAdminPolicy = {
  //   DL: [BES_ADMIN_PERMISSION_GROUP],
  // };

  beforeEach(async () => {
    await resetTestData();
    await app.grantAccess(policy);
    await setupTest(models, TEST_SETUP);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('GET /mapOverlayVisualisations/:id', () => {
    it('Throws if no BES Admin or Viz Builder User access', async () => {
      app.revokeAccess();
      await app.grantAccess(publicPolicy);
      const { body } = await app.get('mapOverlayVisualisations/invalid_id');
      expect(body.error).to.equal(
        'You require Tupaia Admin Panel or BES Admin permission to fetch visualisations.',
      );
    });

    it('Throws if id or code is not provided', async () => {
      const response = await app.get('mapOverlayVisualisations/invalid_id');
      expectError(response, /visualisation does not exist/i);
    });
  });

  describe('GET /mapOverlayVisualisations', () => {
    it('Returns existing map overlay visualisations, filtered by code', async () => {
      const response = await app.get('mapOverlayVisualisations', {
        query: {
          filter: {
            code: ['Modern_Map_Overlay'],
          },
        },
      });
      expectSuccess(response, [
        {
          mapOverlay: {
            id: modernMapOverlay.id,
            code: 'Modern_Map_Overlay',
            name: 'Modern Map Overlay',
            config: { displayType: 'spectrum', scaleType: 'neutral' },
            permissionGroup: 'Test Permission Group',
            countryCodes: ['DL'],
            linkedMeasures: [],
            projectCodes: ['explore'],
            reportCode: 'Modern_Report',
            dataServices: [{ isDataRegional: true }],
            legacy: false,
            entityAttributesFilter: {},
          },
          report: {
            code: modernReport.code,
            permissionGroup: VIZ_BUILDER_PERMISSION_GROUP,
            config: modernReport.config,
            latestDataParameters: {},
          },
        },
      ]);
    });
  });
});
