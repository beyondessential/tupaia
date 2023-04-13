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
import { upload } from '../middleware';
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
  FetchDataTablePreviewDataRequest,
  FetchDataTablePreviewDataRoute,
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
  FetchTransformSchemasRequest,
  FetchTransformSchemasRoute,
  FetchDataTableBuiltInParamsRequest,
  FetchDataTableBuiltInParamsRoute,
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
      handleWith(FetchHierarchyEntitiesRoute),
    )
    .post<FetchReportPreviewDataRequest>(
      'fetchReportPreviewData',
      handleWith(FetchReportPreviewDataRoute),
    )
    .post<SaveDashboardVisualisationRequest>(
      'dashboardVisualisation',
      handleWith(SaveDashboardVisualisationRoute),
    )
    .put<SaveDashboardVisualisationRequest>(
      'dashboardVisualisation/:dashboardVisualisationId',
      handleWith(SaveDashboardVisualisationRoute),
    )
    .post<SaveMapOverlayVisualisationRequest>(
      'mapOverlayVisualisation',
      handleWith(SaveMapOverlayVisualisationRoute),
    )
    .put<SaveMapOverlayVisualisationRequest>(
      'mapOverlayVisualisation/:mapOverlayVisualisationId',
      handleWith(SaveMapOverlayVisualisationRoute),
    )
    .get<FetchDashboardVisualisationRequest>(
      'dashboardVisualisation/:dashboardVisualisationId',
      handleWith(FetchDashboardVisualisationRoute),
    )
    .post<FetchDataTablePreviewDataRequest>(
      'fetchDataTablePreviewData',
      handleWith(FetchDataTablePreviewDataRoute),
    )
    .get<FetchDataTableBuiltInParamsRequest>(
      'fetchDataTableBuiltInParams',
      handleWith(FetchDataTableBuiltInParamsRoute),
    )
    .get(
      'export/dashboardVisualisation/:dashboardVisualisationId',
      handleWith(ExportDashboardVisualisationRoute),
    )
    .get(
      'export/mapOverlayVisualisation/:mapOverlayVisualisationId',
      handleWith(ExportMapOverlayVisualisationRoute),
    )
    .post<ExportDashboardVisualisationRequest>(
      'export/dashboardVisualisation',
      handleWith(ExportDashboardVisualisationRoute),
    )
    .post<ExportMapOverlayVisualisationRequest>(
      'export/mapOverlayVisualisation',
      handleWith(ExportMapOverlayVisualisationRoute),
    )
    .post<ImportDashboardVisualisationRequest>(
      'import/dashboardVisualisations',
      upload.array('dashboardVisualisations'),
      handleWith(ImportDashboardVisualisationRoute),
    )
    .post<ImportMapOverlayVisualisationRequest>(
      'import/mapOverlayVisualisations',
      upload.array('mapOverlayVisualisations'),
      handleWith(ImportMapOverlayVisualisationRoute),
    )
    .post<UploadTestDataRequest>(
      'uploadTestData',
      upload.single('testData'),
      handleWith(UploadTestDataRoute),
    )
    .get<FetchMapOverlayVisualisationRequest>(
      'mapOverlayVisualisation/:mapOverlayVisualisationId',
      handleWith(FetchMapOverlayVisualisationRoute),
    )
    .get<FetchTransformSchemasRequest>(
      'fetchTransformSchemas',
      handleWith(FetchTransformSchemasRoute),
    )
    .build();

  useForwardUnhandledRequests(app, CENTRAL_API_URL);

  return app;
}
