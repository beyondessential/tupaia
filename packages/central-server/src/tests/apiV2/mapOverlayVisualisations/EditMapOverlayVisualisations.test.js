import { setupTest } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { expectSuccess, expectError, resetTestData, TestableApp } from '../../testUtilities';
import {
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../../permissions';
import { TEST_SETUP, findTestRecordByCode } from './mapOverlayVisualisations.fixtures';

describe('PUT map overlay visualisations', async () => {
  const app = new TestableApp();
  const { models } = app;

  const modernMapOverlay = findTestRecordByCode('mapOverlay', 'Modern_Map_Overlay');
  const modernReport = findTestRecordByCode('report', 'Modern_Report');

  const policy = {
    DL: [
      TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
      VIZ_BUILDER_PERMISSION_GROUP,
      'Test Permission Group',
    ],
  };

  const unacceptedPolicy = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, VIZ_BUILDER_PERMISSION_GROUP],
  };

  const modernVisualisation = {
    mapOverlay: modernMapOverlay,
    report: {
      code: modernReport.code,
      permission_group: 'Test Permission Group',
      config: {
        fetch: {
          dataElements: ['BCD1'],
          aggregations: ['RAW'],
        },
        transform: [{ by: '=$dataElement', transform: 'sortRows' }],
      },
    },
  };

  beforeEach(async () => {
    await resetTestData();
    await app.grantAccess(policy);
    await setupTest(models, TEST_SETUP);
  });

  afterEach(() => {
    app.revokeAccess();
  });

  describe('PUT /mapOverlayVisualisations/:id', () => {
    it('Throws if body not provided', async () => {
      const response = await app.put(`mapOverlayVisualisations/${modernMapOverlay.id}`, {});
      expectError(
        response,
        'Internal server error: No map overlay or report information was provided in the request.',
      );
    });

    it('Throws if a permission is not satisfied', async () => {
      app.revokeAccess();
      await app.grantAccess(unacceptedPolicy);
      const response = await app.put(`mapOverlayVisualisations/${modernMapOverlay.id}`, {
        body: modernVisualisation,
      });
      expectError(response, 'Cannot edit map overlay', 403);
    });

    it('Makes change successfully', async () => {
      const response = await app.put(`mapOverlayVisualisations/${modernMapOverlay.id}`, {
        body: { ...modernVisualisation, name: 'New Name' },
      });
      const reportRecord = await models.report.findOne({
        code: modernReport.code,
      });
      expect(reportRecord.config).to.deep.equal(modernVisualisation.report.config);
      expectSuccess(response);
    });
  });
});
