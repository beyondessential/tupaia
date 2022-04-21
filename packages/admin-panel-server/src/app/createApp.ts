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
  ExportMapOverlayVisualisationRequest,
  ExportMapOverlayVisualisationRoute,
  FetchDashboardVisualisationRequest,
  FetchDashboardVisualisationRoute,
  FetchHierarchyEntitiesRequest,
  FetchHierarchyEntitiesRoute,
  FetchMapOverlayVisualisationRequest,
  FetchMapOverlayVisualisationRoute,
  FetchReportPreviewDataRequest,
  FetchReportPreviewDataRoute,
  ImportDashboardVisualisationRequest,
  ImportDashboardVisualisationRoute,
  SaveDashboardVisualisationRequest,
  SaveDashboardVisualisationRoute,
  SaveMapOverlayVisualisationRequest,
  SaveMapOverlayVisualisationRoute,
  UploadTestDataRequest,
  UploadTestDataRoute,
  UserRoute,
  ImportMapOverlayVisualisationRequest,
  ImportMapOverlayVisualisationRoute,
  FetchAggregationOptionsRequest,
  FetchAggregationOptionsRoute,
  FetchTransformSchemasRequest,
  FetchTransformSchemasRoute,
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
    .post<SaveMapOverlayVisualisationRequest>(
      '/v1/mapOverlayVisualisation',
      verifyBESAdminAccess,
      handleWith(SaveMapOverlayVisualisationRoute),
    )
    .put<SaveMapOverlayVisualisationRequest>(
      '/v1/mapOverlayVisualisation/:mapOverlayVisualisationId',
      verifyBESAdminAccess,
      handleWith(SaveMapOverlayVisualisationRoute),
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
    .get(
      '/v1/export/mapOverlayVisualisation/:mapOverlayVisualisationId',
      verifyBESAdminAccess,
      handleWith(ExportMapOverlayVisualisationRoute),
    )
    .post<ExportDashboardVisualisationRequest>(
      '/v1/export/dashboardVisualisation',
      verifyBESAdminAccess,
      handleWith(ExportDashboardVisualisationRoute),
    )
    .post<ExportMapOverlayVisualisationRequest>(
      '/v1/export/mapOverlayVisualisation',
      verifyBESAdminAccess,
      handleWith(ExportMapOverlayVisualisationRoute),
    )
    .post<ImportDashboardVisualisationRequest>(
      '/v1/import/dashboardVisualisations',
      verifyBESAdminAccess,
      upload.array('dashboardVisualisations'),
      handleWith(ImportDashboardVisualisationRoute),
    )
    .post<ImportMapOverlayVisualisationRequest>(
      '/v1/import/mapOverlayVisualisations',
      verifyBESAdminAccess,
      upload.array('mapOverlayVisualisations'),
      handleWith(ImportMapOverlayVisualisationRoute),
    )
    .post<UploadTestDataRequest>(
      '/v1/uploadTestData',
      verifyBESAdminAccess,
      upload.single('testData'),
      handleWith(UploadTestDataRoute),
    )
    .get<FetchMapOverlayVisualisationRequest>(
      '/v1/mapOverlayVisualisation/:mapOverlayVisualisationId',
      verifyBESAdminAccess,
      handleWith(FetchMapOverlayVisualisationRoute),
    )
    .get<FetchAggregationOptionsRequest>(
      '/v1/fetchAggregationOptions',
      verifyBESAdminAccess,
      handleWith(FetchAggregationOptionsRoute),
    )
    .get<FetchTransformSchemasRequest>(
      '/v1/fetchTransformSchemas',
      verifyBESAdminAccess,
      handleWith(FetchTransformSchemasRoute),
    )
    .build();

  useForwardUnhandledRequests(app, MEDITRAK_API_URL);

  return app;
}
