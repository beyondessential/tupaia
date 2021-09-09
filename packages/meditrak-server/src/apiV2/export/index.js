/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import { catchAsyncErrors, emailAfterTimeout } from '../middleware';
import { useRouteHandler } from '../RouteHandler';
import { constructExportEmail } from './constructExportEmail';
import { DownloadHandler } from './download';
import { exportSurveyResponses } from './exportSurveyResponses';
import { exportSurveys } from './exportSurveys';

const exportRoutes = express.Router();

exportRoutes.get('/download/:fileName', useRouteHandler(DownloadHandler));

exportRoutes.use(emailAfterTimeout(constructExportEmail));

exportRoutes.get('/surveyResponses', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveyResponses/:surveyResponseId', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveys', catchAsyncErrors(exportSurveys));
exportRoutes.get('/surveys/:surveyId', catchAsyncErrors(exportSurveys));

export { exportRoutes };
