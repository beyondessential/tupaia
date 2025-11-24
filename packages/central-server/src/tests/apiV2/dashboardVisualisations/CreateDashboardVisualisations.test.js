import { setupTest } from '@tupaia/database';
import chaiCjsModule from 'chai';
const { expect } = chaiCjsModule;
import { expectSuccess, expectError, resetTestData, TestableApp } from '../../testUtilities';
import { TEST_SETUP } from './dashboardVisualisations.fixtures';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../../permissions';

const clearRecords = async models => {
  await models.report.delete({ code: 'test_visualisation' });
  await models.dashboardItem.delete({ code: 'test_visualisation' });
};

describe('POST dashboard visualisations', () => {
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
      permission_group: VIZ_BUILDER_PERMISSION_GROUP,
      config: {},
    },
  };

  const policy = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, VIZ_BUILDER_PERMISSION_GROUP],
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
      expectError(
        response,
        "Internal server error: Cannot read properties of undefined (reading 'legacy')",
        undefined,
        false,
      );
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

    it('Throws an error when a dashboard item code does not match the report_code when the visualisation is not a legacy viz', async () => {
      const response = await app.post('dashboardVisualisations/', {
        body: {
          ...TEST_VISUALISATION,
          dashboardItem: {
            ...TEST_VISUALISATION.dashboardItem,
            code: 'test_visualisation_wrong_code',
          },
        },
      });
      expect(response.status).to.equal(500);
    });
  });
});
