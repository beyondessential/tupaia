/*
 * Tupaia
 * Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { Router } from 'express';

import {
  appChangePassword,
  appRequestCountryAccess,
  appRequestResetPassword,
  appResendEmail,
  appSignup,
  appVerifyEmail,
} from '/appServer';
import { oneTimeLogin } from '/authSession';
import { exportChartHandler } from '/export';
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
  api.get('/getUser', catchAsyncErrors(getUser())); // KEEP
  api.post('/login/oneTimeLogin', catchAsyncErrors(oneTimeLogin)); // KEEP
  api.post('/signup', catchAsyncErrors(appSignup())); // KEEP
  api.post('/changePassword', catchAsyncErrors(appChangePassword())); // CULL
  api.post('/resetPassword', catchAsyncErrors(appRequestResetPassword())); // CULL
  api.post('/requestCountryAccess', catchAsyncErrors(appRequestCountryAccess()));
  api.get('/verifyEmail', catchAsyncErrors(appVerifyEmail())); // KEEP
  api.post('/resendEmail', catchAsyncErrors(appResendEmail())); // KEEP
  api.get('/export/chart', catchAsyncErrors(exportChartHandler)); // KEEP
  api.get('/measures', handleWith(MeasuresHandler)); // KEEP
  api.get('/measureData', handleWith(MeasuresDataHandler)); // KEEP
  api.get('/projects', catchAsyncErrors(getProjects)); // KEEP
  api.get('/dashboards', handleWith(DashboardsHandler)); // New style dashboards // KEEP
  api.get('/report/:reportCode', handleWith(ReportHandler)); // KEEP
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
