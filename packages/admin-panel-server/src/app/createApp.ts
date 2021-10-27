/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  handleWith,
  useForwardUnhandledRequests,
} from '@tupaia/server-boilerplate';

import { AdminPanelSessionModel } from '../models';
import { hasTupaiaAdminPanelAccess } from '../utils';
import { upload, verifyBESAdminAccess } from '../middleware';
import {
  ExportDashboardVisualisationRequest,
  ExportDashboardVisualisationRoute,
  FetchDashboardVisualisationRequest,
  FetchDashboardVisualisationRoute,
  FetchHierarchyEntitiesRequest,
  FetchHierarchyEntitiesRoute,
  FetchReportPreviewDataRequest,
  FetchReportPreviewDataRoute,
  ImportDashboardVisualisationRequest,
  ImportDashboardVisualisationRoute,
  SaveDashboardVisualisationRequest,
  SaveDashboardVisualisationRoute,
  UploadTestDataRequest,
  UploadTestDataRoute,
  UserRoute,
} from '../routes';

const { MEDITRAK_API_URL = 'http://localhost:8090/v2' } = process.env;

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase())
    .useSessionModel(AdminPanelSessionModel)
    .verifyLogin(hasTupaiaAdminPanelAccess)
    .get('/v1/user', handleWith(UserRoute))
    .get<FetchHierarchyEntitiesRequest>(
      '/v1/hierarchy/:hierarchyName/:entityCode',
      verifyBESAdminAccess,
      handleWith(FetchHierarchyEntitiesRoute),
    )
    .post<FetchReportPreviewDataRequest>(
      '/v1/fetchReportPreviewData',
      verifyBESAdminAccess,
      handleWith(FetchReportPreviewDataRoute),
    )
    .post<SaveDashboardVisualisationRequest>(
      '/v1/dashboardVisualisation',
      verifyBESAdminAccess,
      handleWith(SaveDashboardVisualisationRoute),
    )
    .put<SaveDashboardVisualisationRequest>(
      '/v1/dashboardVisualisation/:dashboardVisualisationId',
      verifyBESAdminAccess,
      handleWith(SaveDashboardVisualisationRoute),
    )
    .get<FetchDashboardVisualisationRequest>(
      '/v1/dashboardVisualisation/:dashboardVisualisationId',
      verifyBESAdminAccess,
      handleWith(FetchDashboardVisualisationRoute),
    )
    .get(
      '/v1/export/dashboardVisualisation/:dashboardVisualisationId',
      verifyBESAdminAccess,
      handleWith(ExportDashboardVisualisationRoute),
    )
    .post<ExportDashboardVisualisationRequest>(
      '/v1/export/dashboardVisualisation',
      verifyBESAdminAccess,
      handleWith(ExportDashboardVisualisationRoute),
    )
    .post<ImportDashboardVisualisationRequest>(
      '/v1/import/dashboardVisualisations',
      verifyBESAdminAccess,
      upload.single('dashboardVisualisations'),
      handleWith(ImportDashboardVisualisationRoute),
    )
    .post<UploadTestDataRequest>(
      '/v1/uploadTestData',
      verifyBESAdminAccess,
      upload.single('testData'),
      handleWith(UploadTestDataRoute),
    )
    .build();

  useForwardUnhandledRequests(app, MEDITRAK_API_URL);

  return app;
}
