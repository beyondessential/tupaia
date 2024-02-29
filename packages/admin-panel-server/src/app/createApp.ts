/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */
import { TupaiaDatabase } from '@tupaia/database';
import { OrchestratorApiBuilder, forwardRequest, handleWith } from '@tupaia/server-boilerplate';

import { AdminPanelSessionModel } from '../models';
import { hasTupaiaAdminPanelAccess } from '../utils';
import { upload } from '../middleware';
import {
  ExportDashboardVisualisationRequest,
  ExportDashboardVisualisationRoute,
  ExportDataTableRequest,
  ExportDataTableRoute,
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
  ImportDataTableRequest,
  ImportDataTableRoute,
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

const {
  CENTRAL_API_URL = 'http://localhost:8090/v2',
  ENTITY_API_URL = 'http://localhost:8050/v1',
} = process.env;

/**
 * Set up express server with middleware,
 */
export async function createApp() {
  const forwardToEntityApi = forwardRequest(ENTITY_API_URL);
  const builder = new OrchestratorApiBuilder(new TupaiaDatabase(), 'admin-panel')
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
    .get<ExportDataTableRequest>('export/dataTable/:dataTableId', handleWith(ExportDataTableRoute))
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
    .post<ImportDataTableRequest>(
      'import/dataTables',
      upload.array('dataTables'),
      handleWith(ImportDataTableRoute),
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
    .use('hierarchy', forwardToEntityApi)
    .use('hierarchies', forwardToEntityApi)
    .use('*', forwardRequest(CENTRAL_API_URL));

  await builder.initialiseApiClient();

  const app = builder.build();

  return app;
}
