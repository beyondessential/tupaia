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
import { upload, verifyVizBuilderUserAccess } from '../middleware';
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
import { authHandlerProvider } from '../auth';

const { CENTRAL_API_URL = 'http://localhost:8090/v2' } = process.env;

/**
 * Set up express server with middleware,
 */
export function createApp() {
  const app = new OrchestratorApiBuilder(new TupaiaDatabase(), 'admin-panel')
    .attachApiClientToContext(authHandlerProvider)
    .useSessionModel(AdminPanelSessionModel)
    .verifyLogin(hasTupaiaAdminPanelAccess)
    .get('user', handleWith(UserRoute))
    .get<FetchHierarchyEntitiesRequest>(
      'hierarchy/:hierarchyName/:entityCode',
      verifyVizBuilderUserAccess,
      handleWith(FetchHierarchyEntitiesRoute),
    )
    .post<FetchReportPreviewDataRequest>(
      'fetchReportPreviewData',
      verifyVizBuilderUserAccess,
      handleWith(FetchReportPreviewDataRoute),
    )
    .post<SaveDashboardVisualisationRequest>(
      'dashboardVisualisation',
      verifyVizBuilderUserAccess,
      handleWith(SaveDashboardVisualisationRoute),
    )
    .put<SaveDashboardVisualisationRequest>(
      'dashboardVisualisation/:dashboardVisualisationId',
      verifyVizBuilderUserAccess,
      handleWith(SaveDashboardVisualisationRoute),
    )
    .post<SaveMapOverlayVisualisationRequest>(
      'mapOverlayVisualisation',
      verifyVizBuilderUserAccess,
      handleWith(SaveMapOverlayVisualisationRoute),
    )
    .put<SaveMapOverlayVisualisationRequest>(
      'mapOverlayVisualisation/:mapOverlayVisualisationId',
      verifyVizBuilderUserAccess,
      handleWith(SaveMapOverlayVisualisationRoute),
    )
    .get<FetchDashboardVisualisationRequest>(
      'dashboardVisualisation/:dashboardVisualisationId',
      verifyVizBuilderUserAccess,
      handleWith(FetchDashboardVisualisationRoute),
    )
    .get(
      'export/dashboardVisualisation/:dashboardVisualisationId',
      verifyVizBuilderUserAccess,
      handleWith(ExportDashboardVisualisationRoute),
    )
    .get(
      'export/mapOverlayVisualisation/:mapOverlayVisualisationId',
      verifyVizBuilderUserAccess,
      handleWith(ExportMapOverlayVisualisationRoute),
    )
    .post<ExportDashboardVisualisationRequest>(
      'export/dashboardVisualisation',
      verifyVizBuilderUserAccess,
      handleWith(ExportDashboardVisualisationRoute),
    )
    .post<ExportMapOverlayVisualisationRequest>(
      'export/mapOverlayVisualisation',
      verifyVizBuilderUserAccess,
      handleWith(ExportMapOverlayVisualisationRoute),
    )
    .post<ImportDashboardVisualisationRequest>(
      'import/dashboardVisualisations',
      verifyVizBuilderUserAccess,
      upload.array('dashboardVisualisations'),
      handleWith(ImportDashboardVisualisationRoute),
    )
    .post<ImportMapOverlayVisualisationRequest>(
      'import/mapOverlayVisualisations',
      verifyVizBuilderUserAccess,
      upload.array('mapOverlayVisualisations'),
      handleWith(ImportMapOverlayVisualisationRoute),
    )
    .post<UploadTestDataRequest>(
      'uploadTestData',
      verifyVizBuilderUserAccess,
      upload.single('testData'),
      handleWith(UploadTestDataRoute),
    )
    .get<FetchMapOverlayVisualisationRequest>(
      'mapOverlayVisualisation/:mapOverlayVisualisationId',
      verifyVizBuilderUserAccess,
      handleWith(FetchMapOverlayVisualisationRoute),
    )
    .get<FetchAggregationOptionsRequest>(
      'fetchAggregationOptions',
      verifyVizBuilderUserAccess,
      handleWith(FetchAggregationOptionsRoute),
    )
    .get<FetchTransformSchemasRequest>(
      'fetchTransformSchemas',
      verifyVizBuilderUserAccess,
      handleWith(FetchTransformSchemasRoute),
    )
    .build();

  useForwardUnhandledRequests(app, CENTRAL_API_URL);

  return app;
}
