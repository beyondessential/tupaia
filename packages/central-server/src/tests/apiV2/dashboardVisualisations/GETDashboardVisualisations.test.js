import { setupTest } from '@tupaia/database';
import { camelKeys, stripUpdatedAtSyncTickFromArray, stripUpdatedAtSyncTickFromObject } from '@tupaia/utils';

import { expectError, expectSuccess, resetTestData, TestableApp } from '../../testUtilities';
import { findTestRecordByCode, TEST_SETUP } from './dashboardVisualisations.fixtures';
import {
  BES_ADMIN_PERMISSION_GROUP,
  TUPAIA_ADMIN_PANEL_PERMISSION_GROUP,
  VIZ_BUILDER_PERMISSION_GROUP,
} from '../../../permissions';

describe('GET dashboard visualisations', () => {
  const getVizId = code => findTestRecordByCode('dashboardItem', code).id;

  const app = new TestableApp();
  const { models } = app;

  const modernDashboardItem = findTestRecordByCode('dashboardItem', 'Modern_Report');
  const legacyDashboardItem = findTestRecordByCode('dashboardItem', 'Legacy_Report');
  const modernReport = findTestRecordByCode('report', 'Modern_Report');
  const legacyReport = findTestRecordByCode('legacyReport', 'Legacy_Report');

  const MODERN_DASHBOARD_VISUALISATION = {
    dashboardItem: camelKeys(modernDashboardItem),
    report: {
      code: modernReport.code,
      config: modernReport.config,
      permissionGroup: VIZ_BUILDER_PERMISSION_GROUP,
      latestDataParameters: {},
    },
  };
  const LEGACY_DASHBOARD_VISUALISATION = {
    dashboardItem: camelKeys(legacyDashboardItem),
    report: {
      code: legacyReport.code,
      dataBuilder: legacyReport.data_builder,
      config: legacyReport.data_builder_config,
      dataServices: legacyReport.data_services,
    },
  };

  const policy = {
    DL: [TUPAIA_ADMIN_PANEL_PERMISSION_GROUP, VIZ_BUILDER_PERMISSION_GROUP],
  };

  const besAdminPolicy = {
    DL: [BES_ADMIN_PERMISSION_GROUP],
  };

  before(async () => {
    await resetTestData();
    await app.grantAccess(policy);
    await setupTest(models, TEST_SETUP);
  });

  after(() => {
    app.revokeAccess();
  });

  describe('GET /dashboardVisualisations/:id', () => {
    it('Throws if id or code is not provided', async () => {
      const response = await app.get('dashboardVisualisations/invalid_id');
      expectError(response, /visualisation does not exist/i);
    });

    it('Throws if  visualisation has no report', async () => {
      const id = getVizId('Dashboard_Item_No_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectError(response, 'Cannot find a report for visualisation');
    });

    it('Throws if dashboard visualisation has invalid report', async () => {
      const id = getVizId('Dashboard_Item_Invalid_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectError(response, 'Cannot find a report for visualisation');
    });

    it('Returns an existing modern dashboard visualisation', async () => {
      const id = getVizId('Modern_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectSuccess(
        { ...response, body: stripUpdatedAtSyncTickFromObject(response.body) },
        MODERN_DASHBOARD_VISUALISATION,
      );
    });

    it('Returns an existing legacy dashboard visualisation', async () => {
      const id = getVizId('Legacy_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectSuccess(
        { ...response, body: stripUpdatedAtSyncTickFromObject(response.body) },
        LEGACY_DASHBOARD_VISUALISATION,
      );
    });

    it('Returns an existing visualisation with only BES Admin permission', async () => {
      app.revokeAccess();
      await app.grantAccess(besAdminPolicy);
      const id = getVizId('Legacy_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectSuccess(
        { ...response, body: stripUpdatedAtSyncTickFromObject(response.body) },
        LEGACY_DASHBOARD_VISUALISATION,
      );
    });
  });

  describe('GET /dashboardVisualisations', () => {
    it('Returns existing dashboard visualisations, filtered by code', async () => {
      const response = await app.get('dashboardVisualisations', {
        query: {
          filter: {
            code: ['Modern_Report', 'Legacy_Report'],
          },
        },
      });
      expectSuccess({ ...response, body: stripUpdatedAtSyncTickFromArray(response.body) }, [
        MODERN_DASHBOARD_VISUALISATION,
        LEGACY_DASHBOARD_VISUALISATION,
      ]);
    });
  });
});
