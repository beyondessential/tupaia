/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { setupTest } from '@tupaia/database';
import { expect } from 'chai';
import { expectSuccess, expectError, resetTestData, TestableApp } from '../../testUtilities';
import { TEST_SETUP } from './dashboardVisualisations.fixtures';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
} from '../../../permissions';

const clearRecords = async models => {
  await models.report.delete({ code: 'test_visualisation' });
  await models.dashboardItem.delete({ code: 'test_visualisation' });
};

describe('POST dashboard visualisations', () => {
  // const getVizId = code => findTestRecordByCode('dashboardItem', code).id;

  const app = new TestableApp();
  const { models } = app;

  const TEST_VISUALISATION = {
    dashboardItem: {
      code: 'test_visualisation',
      config: { type: 'chart', name: 'Test Visualisation' },
      report_code: 'test_visualisation',
      legacy: false,
    },
    report: {
      code: 'test_visualisation',
      permission_group: 'Viz_Permissions',
      config: {},
    },
  };

  const policy = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, 'Viz_Permissions'],
  };

  const besAdminPolicy = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  beforeEach(async () => {
    await resetTestData();
    await app.grantAccess(policy);
    await setupTest(models, TEST_SETUP);
  });

  afterEach(async () => {
    await clearRecords(models);
    app.revokeAccess();
  });

  describe('POST /dashboardVisualisations/', () => {
    it('Throws if body not provided', async () => {
      const response = await app.post('dashboardVisualisations/', {});
      expectError(response, "Internal server error: Cannot read property 'legacy' of undefined");
    });

    it('Returns a successful response', async () => {
      const response = await app.post('dashboardVisualisations/', {
        body: TEST_VISUALISATION,
      });
      expectSuccess(response);
    });

    it('Successfully creates a report', async () => {
      await app.post('dashboardVisualisations/', {
        body: TEST_VISUALISATION,
      });
      const report = await models.report.findOne({ code: 'test_visualisation' });
      expect(report.id).to.not.be.undefined;
    });

    it('Successfully creates a dashboard item record', async () => {
      await app.post('dashboardVisualisations/', {
        body: TEST_VISUALISATION,
      });
      const dashboardItem = await models.dashboardItem.findOne({ code: 'test_visualisation' });
      expect(dashboardItem.id).to.not.be.undefined;
    });

    it('Posts successfully with BES Permissions only', async () => {
      app.revokeAccess();
      app.grantAccess(besAdminPolicy);
      const response = await app.post('dashboardVisualisations/', {
        body: TEST_VISUALISATION,
      });
      expectSuccess(response);
    });
  });
});
