/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Router } from 'express';

import {
  appRequestCountryAccess,
  appRequestResetPassword,
  appResendEmail,
  appSignup,
  appVerifyEmail,
} from '/appServer';
import { oneTimeLogin } from '/authSession';
import { exportChartHandler, ExportSurveyDataHandler, ExportSurveyResponsesHandler } from '/export';
import { getUser } from './getUser';
import MeasuresHandler from './measures';
import MeasuresDataHandler from './measureData';
import DashboardsHandler from './dashboards';
import { ReportHandler } from './report';
import { getProjects } from './projects';
import { getLandingPage } from './landingPages';

const handleWith = Handler =>
  catchAsyncErrors((...params) => new Handler(...params).handleRequest());

export const getRoutesForApiV1 = () => {
  const api = Router();
  // mount the routes
  api.get('/getUser', catchAsyncErrors(getUser()));
  api.post('/login/oneTimeLogin', catchAsyncErrors(oneTimeLogin));
  api.post('/signup', catchAsyncErrors(appSignup()));
  api.post('/resetPassword', catchAsyncErrors(appRequestResetPassword()));
  api.post('/requestCountryAccess', catchAsyncErrors(appRequestCountryAccess()));
  api.get('/verifyEmail', catchAsyncErrors(appVerifyEmail()));
  api.post('/resendEmail', catchAsyncErrors(appResendEmail()));
  api.get('/export/chart', catchAsyncErrors(exportChartHandler));
  api.get('/export/surveyDataDownload', handleWith(ExportSurveyDataHandler));
  api.get('/export/surveyResponses', handleWith(ExportSurveyResponsesHandler));
  api.get('/measures', handleWith(MeasuresHandler));
  api.get('/measureData', handleWith(MeasuresDataHandler));
  api.get('/projects', catchAsyncErrors(getProjects));
  api.get('/dashboards', handleWith(DashboardsHandler)); // New style dashboards
  api.get('/report/:reportCode', handleWith(ReportHandler));
  api.get('/landingPage/:landingPageUrl', catchAsyncErrors(getLandingPage));

  return api;
};

/**
 * All async routes need to be wrapped with an error catcher that simply passes the error to the
 * next() function, causing error handling middleware to be fired. Otherwise, async errors will be
 * swallowed.
 */
const catchAsyncErrors = routeHandler => (res, req, next) => {
  const returnValue = routeHandler(res, req, next);
  if (returnValue && returnValue.catch) {
    // Return value is a Promise, add an error handler
    returnValue.catch(next);
  }
};
