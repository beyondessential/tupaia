/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import { catchAsyncErrors, emailAfterTimeout } from '../middleware';
import { constructExportEmail } from './constructExportEmail';
import { exportSurveyResponses } from './exportSurveyResponses';
import { exportSurveys } from './exportSurveys';

const exportRoutes = express.Router();

exportRoutes.get(
  '/surveyResponses',
  emailAfterTimeout(constructExportEmail),
  catchAsyncErrors(exportSurveyResponses),
);
exportRoutes.get('/surveyResponses/:surveyResponseId', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveys', catchAsyncErrors(exportSurveys));
exportRoutes.get('/surveys/:surveyId', catchAsyncErrors(exportSurveys));

export { exportRoutes };
