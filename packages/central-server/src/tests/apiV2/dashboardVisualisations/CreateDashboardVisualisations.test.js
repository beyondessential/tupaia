/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { setupTest } from '@tupaia/database';
import { camelKeys } from '@tupaia/utils';

import { expectError, expectSuccess, resetTestData, TestableApp } from '../../testUtilities';
import { findTestRecordByCode, TEST_SETUP } from './dashboardVisualisations.fixtures';
import {
  BES_ADMIN_PERMISSION_GROUP,
  VIZ_BUILDER_USER_PERMISSION_GROUP,
} from '../../../permissions';
import TEST_VISUALISATION from '../../testData/visualisations/testVisualisation.json';

describe('POST dashboard visualisations', () => {
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
  const TEST_VISUALISATION = {
    dashboardItem: {
      code: 'asdfasdf',
      config: { type: 'chart', name: 'asdfasdf' },
      report_code: 'asdfasdf',
      legacy: false,
    },
    report: {
      code: 'asdfasdf',
      permission_group: 'Viz_Permissions',
      config: {},
    },
  };

  const policy = {
    DL: [VIZ_BUILDER_USER_PERMISSION_GROUP, 'Viz_Permissions'],
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

  describe('POST /dashboardVisualisations/', () => {
    it('Throws if body not provided', async () => {
      const response = await app.post('dashboardVisualisations/', {
        body: TEST_VISUALISATION,
      });
      expectSuccess(response);
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
      const id = getVizId('Modern_Dashboard_Item');
      const response = await app.get(`dashboardVisualisations/${id}`);

      expectSuccess(response, MODERN_DASHBOARD_VISUALISATION);
    });
  });
});
