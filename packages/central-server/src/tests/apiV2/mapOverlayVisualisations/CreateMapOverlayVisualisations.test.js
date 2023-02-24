/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { setupTest, generateTestId } from '@tupaia/database';
import { expectSuccess, expectError, resetTestData, TestableApp } from '../../testUtilities';
import { TUPAIA_ADMIN_PANEL_PERMISSION_GROUP } from '../../../permissions';
import { TEST_SETUP } from './mapOverlayVisualisations.fixtures';

const clearRecords = async models => {
  await models.report.delete({ code: 'new_visual_report' });
  await models.mapOverlay.delete({ code: 'new_visual' });
};

describe('POST map overlay visualisations', async () => {
  const app = new TestableApp();
  const { models } = app;

  const policy = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Viz_Permissions'],
  };

  const vizBuilderOnlyPermission = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP],
  };

  const permissionGroupId = generateTestId();

  const NEW_VISUALISATION = {
    mapOverlay: {
      id: generateTestId(),
      code: 'new_visual',
      name: 'New Visual',
      config: { displayType: 'spectrum', scaleType: 'neutral' },
      permission_group: 'Viz_Permissions',
      country_codes: '{DL}',
      linkedMeasures: [],
      project_codes: '{explore}',
      report_code: 'new_visual_report',
      dataServices: [{ isDataRegional: true }],
      legacy: false,
    },
    report: {
      code: 'new_visual_report',
      permission_group: 'Viz_Permissions',
      config: {
        code: 'new_visual_report',
        config: {
          fetch: {
            dataElements: ['BCD1'],
            aggregations: ['FINAL_EACH_YEAR'],
          },
          transform: [{ by: '=$dataElement', transform: 'sortRows' }],
        },
        permission_group_id: permissionGroupId,
      },
    },
  };

  beforeEach(async () => {
    await resetTestData();
    await app.grantAccess(policy);
    await setupTest(models, TEST_SETUP);
  });

  afterEach(() => {
    clearRecords(models);
    app.revokeAccess();
  });

  describe('POST /dashboardVisualisations/', () => {
    it('Throws if body not provided', async () => {
      const response = await app.post('mapOverlayVisualisations/', {});
      expectError(response, "Internal server error: Cannot read property 'legacy' of undefined");
    });

    it('Returns a successful response', async () => {
      const response = await app.post('mapOverlayVisualisations/', {
        body: NEW_VISUALISATION,
      });
      expectSuccess(response);
    });

    it('Throws if Viz Builder User permission without report permission', async () => {
      app.revokeAccess();
      await app.grantAccess(vizBuilderOnlyPermission);
      const response = await app.post('mapOverlayVisualisations/', {
        body: NEW_VISUALISATION,
      });
      expectError(
        response,
        'Database error: Creating record - You do not have access to all related permission groups',
      );
    });
  });
});
