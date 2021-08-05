/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import { catchAsyncErrors } from '../middleware';
import { exportSurveyResponses } from './exportSurveyResponses';
import { exportSurveys } from './exportSurveys';

const exportRoutes = express.Router();

exportRoutes.get('/surveyResponses', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveyResponses/:surveyResponseId', catchAsyncErrors(exportSurveyResponses));
exportRoutes.get('/surveys', catchAsyncErrors(exportSurveys));
exportRoutes.get('/surveys/:surveyId', catchAsyncErrors(exportSurveys));

export { exportRoutes };
