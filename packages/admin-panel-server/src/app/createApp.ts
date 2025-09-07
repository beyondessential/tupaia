import { NextFunction, Request, RequestHandler, Response } from 'express';

import { TupaiaDatabase } from '@tupaia/database';
import {
  OrchestratorApiBuilder,
  RequiresSessionAuthHandler,
  forwardRequest,
  handleWith,
} from '@tupaia/server-boilerplate';
import { getEnvVarOrDefault } from '@tupaia/utils';

import { upload } from '../middleware';
import { AdminPanelSessionModel } from '../models';
import {
  ExportDashboardVisualisationRequest,
  ExportDashboardVisualisationRoute,
  ExportDataTableRequest,
  ExportDataTableRoute,
  ExportEntityHierarchiesRequest,
  ExportEntityHierarchiesRoute,
  ExportMapOverlayVisualisationRequest,
  ExportMapOverlayVisualisationRoute,
  FetchDashboardVisualisationRequest,
  FetchDashboardVisualisationRoute,
  FetchDataTableBuiltInParamsRequest,
  FetchDataTableBuiltInParamsRoute,
  FetchDataTablePreviewDataRequest,
  FetchDataTablePreviewDataRoute,
  FetchHierarchyEntitiesRequest,
  FetchHierarchyEntitiesRoute,
  FetchMapOverlayVisualisationRequest,
  FetchMapOverlayVisualisationRoute,
  FetchReportPreviewDataRequest,
  FetchReportPreviewDataRoute,
  FetchTransformSchemasRequest,
  FetchTransformSchemasRoute,
  ImportDashboardVisualisationRequest,
  ImportDashboardVisualisationRoute,
  ImportDataTableRequest,
  ImportDataTableRoute,
  ImportMapOverlayVisualisationRequest,
  ImportMapOverlayVisualisationRoute,
  PresentationOptionsPromptRequest,
  PresentationOptionsPromptRoute,
  SaveDashboardVisualisationRequest,
  SaveDashboardVisualisationRoute,
  SaveMapOverlayVisualisationRequest,
  SaveMapOverlayVisualisationRoute,
  UploadTestDataRequest,
  UploadTestDataRoute,
  UserRoute,
} from '../routes';
import { hasTupaiaAdminPanelAccess } from '../utils';
import { PromptManager } from '../viz-builder/prompts/PromptManager';

export const addPromptManagerToContext =
  (promptManager: PromptManager) => (req: Request, _res: Response, next: NextFunction) => {
    req.ctx.promptManager = promptManager;
    next();
  };

const authHandlerProvider = (req: Request) => new RequiresSessionAuthHandler(req);
/**
 * Set up express server with middleware,
 */
export async function createApp(promptManager: PromptManager) {
  const CENTRAL_API_URL = getEnvVarOrDefault('CENTRAL_API_URL', 'http://localhost:8090/v2');
  const ENTITY_API_URL = getEnvVarOrDefault('ENTITY_API_URL', 'http://localhost:8050/v1');
  const forwardToEntityApi = forwardRequest(ENTITY_API_URL);
  const forwardToCentralApi = forwardRequest(CENTRAL_API_URL);
  const builder = new OrchestratorApiBuilder(new TupaiaDatabase(), 'admin-panel')
    .attachApiClientToContext(authHandlerProvider)
    .useSessionModel(AdminPanelSessionModel)
    .verifyLogin(hasTupaiaAdminPanelAccess)
    .useMiddleware(addPromptManagerToContext(promptManager))
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
    .get<ExportEntityHierarchiesRequest>(
      'export/hierarchies',
      handleWith(ExportEntityHierarchiesRoute),
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
      upload.array('dashboardVisualisations') as RequestHandler,
      handleWith(ImportDashboardVisualisationRoute),
    )
    .post<ImportDataTableRequest>(
      'import/dataTables',
      upload.array('dataTables') as RequestHandler,
      handleWith(ImportDataTableRoute),
    )
    .post<ImportMapOverlayVisualisationRequest>(
      'import/mapOverlayVisualisations',
      upload.array('mapOverlayVisualisations') as RequestHandler,
      handleWith(ImportMapOverlayVisualisationRoute),
    )
    .post<UploadTestDataRequest>(
      'uploadTestData',
      upload.single('testData') as RequestHandler,
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

    // AI Chat
    .post<PresentationOptionsPromptRequest>(
      'presentationOptionsPrompt',
      handleWith(PresentationOptionsPromptRoute),
    )
    .use('hierarchy', forwardToEntityApi)
    .use('hierarchies', forwardToEntityApi)
    .use('dataTableTypes', forwardToCentralApi)
    .use('surveyResponses', forwardToCentralApi)
    .use('*', forwardToCentralApi);

  await builder.initialiseApiClient();

  const app = builder.build();

  return app;
}
