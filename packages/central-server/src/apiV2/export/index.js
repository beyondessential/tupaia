import express from 'express';
import { emailAfterTimeout } from '@tupaia/server-boilerplate';
import { constructExportEmail } from '@tupaia/server-utils';
import { catchAsyncErrors } from '../middleware';
import { useRouteHandler } from '../RouteHandler';
import { DownloadHandler } from './DownloadHandler';
import { exportOptionSet } from './exportOptionSet';
import { exportSurveyResponses } from './exportSurveyResponses';
import { exportSurveys } from './exportSurveys';

const exportRoutes = express.Router();

exportRoutes.get('/download/:fileName', useRouteHandler(DownloadHandler));

exportRoutes.use(emailAfterTimeout(constructExportEmail));

exportRoutes.get('/optionSets/:optionSetId', catchAsyncErrors(exportOptionSet));
exportRoutes.get('/surveyResponses', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveyResponses/:surveyResponseId', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveys', catchAsyncErrors(exportSurveys));
exportRoutes.get('/surveys/:surveyId', catchAsyncErrors(exportSurveys));

export { exportRoutes };
