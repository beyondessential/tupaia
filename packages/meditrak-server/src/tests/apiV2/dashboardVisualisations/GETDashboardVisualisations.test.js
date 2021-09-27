/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { setupTest } from '@tupaia/database';
import { camelKeys } from '@tupaia/utils';

import { expectError, expectSuccess, resetTestData, TestableApp } from '../../testUtilities';
import { findTestRecordByCode, TEST_SETUP } from './dashboardVisualisations.fixtures';

describe('GET dashboard visualisations', () => {
  const getVizId = code => findTestRecordByCode('dashboardItem', code).id;

  const app = new TestableApp();
  const { models } = app;

  const modernDashboardItem = findTestRecordByCode('dashboardItem', 'Modern_Dashboard_Item');
  const legacyDashboardItem = findTestRecordByCode('dashboardItem', 'Legacy_Dashboard_Item');
  const modernReport = findTestRecordByCode('report', 'Modern_Report');
  const legacyReport = findTestRecordByCode('legacyReport', 'Legacy_Report');

  const MODERN_DASHBOARD_VISUALISATION = {
    dashboardItem: camelKeys(modernDashboardItem),
    report: {
      code: modernReport.code,
      config: modernReport.config,
      permissionGroup: 'Viz_Permissions',
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

  before(async () => {
    await resetTestData();
    await app.grantFullAccess();
    await setupTest(models, TEST_SETUP);
  });

  after(() => {
    app.revokeAccess();
  });

  describe('GET /dashboardVisualisations/:id', () => {
    it('Throws error if id or code is not provided', async () => {
      const response = await app.get('dashboardVisualisations/invalid_id');
      expectError(response, /visualisation does not exist/i);
    });

    it('Throws error if  visualisation has no report', async () => {
      const id = getVizId('Dashboard_Item_No_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectError(response, 'Cannot find a report for visualisation');
    });

    it('Throws error if dashboard visualisation has no report', async () => {
      const id = getVizId('Dashboard_Item_Invalid_Report');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectError(response, 'Cannot find a report for visualisation');
    });

    it('Returns an existing modern dashboard visualisation', async () => {
      const id = getVizId('Modern_Dashboard_Item');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectSuccess(response, MODERN_DASHBOARD_VISUALISATION);
    });

    it('Returns an existing legacy dashboard visualisation', async () => {
      const id = getVizId('Legacy_Dashboard_Item');
      const response = await app.get(`dashboardVisualisations/${id}`);
      expectSuccess(response, LEGACY_DASHBOARD_VISUALISATION);
    });
  });

  describe('GET /dashboardVisualisations', () => {
    it('Returns existing dashboard visualisations, filtered by code', async () => {
      const response = await app.get('dashboardVisualisations', {
        query: {
          filter: {
            code: ['Modern_Dashboard_Item', 'Legacy_Dashboard_Item'],
          },
        },
      });
      expectSuccess(response, [MODERN_DASHBOARD_VISUALISATION, LEGACY_DASHBOARD_VISUALISATION]);
    });
  });
});
