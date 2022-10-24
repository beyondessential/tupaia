/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { Router } from 'express';

import {
  appSignup,
  appChangePassword,
  appRequestResetPassword,
  appGetCountryAccessList,
  appRequestCountryAccess,
  appVerifyEmail,
  appResendEmail,
} from '/appServer';
import { login, oneTimeLogin, logout } from '/authSession';
import {
  exportChartHandler,
  ExportSurveyResponsesHandler,
  ExportSurveyDataHandler,
  PDFExportHandler,
} from '/export';
import { getUser } from './getUser';
import MeasuresHandler from './measures';
import MeasuresDataHandler from './measureData';
import OrgUnitSearchHandler from './organisationUnitSearch';
import OrganisationUnitHandler from './organisationUnit';
import DashboardsHandler from './dashboards';
import DashboardItemsHandler from './dashboardItems';
import { ReportHandler } from './report';
import { disasters } from './disasters';

import { getProjects } from './projects';

const handleWith = Handler =>
  catchAsyncErrors((...params) => new Handler(...params).handleRequest());

export const getRoutesForApiV1 = () => {
  const api = Router();
  // mount the routes
  api.get('/getUser', catchAsyncErrors(getUser()));
  api.post('/login', catchAsyncErrors(login));
  api.post('/login/oneTimeLogin', catchAsyncErrors(oneTimeLogin));
  api.get('/logout', catchAsyncErrors(logout));
  api.post('/signup', catchAsyncErrors(appSignup()));
  api.post('/changePassword', catchAsyncErrors(appChangePassword()));
  api.post('/resetPassword', catchAsyncErrors(appRequestResetPassword()));
  api.get('/countryAccessList', catchAsyncErrors(appGetCountryAccessList()));
  api.post('/requestCountryAccess', catchAsyncErrors(appRequestCountryAccess()));
  api.get('/verifyEmail', catchAsyncErrors(appVerifyEmail()));
  api.post('/resendEmail', catchAsyncErrors(appResendEmail()));
  api.get('/export/chart', catchAsyncErrors(exportChartHandler));
  api.get('/export/surveyResponses', handleWith(ExportSurveyResponsesHandler));
  api.get('/export/surveyDataDownload', handleWith(ExportSurveyDataHandler));
  api.get('/organisationUnit', handleWith(OrganisationUnitHandler));
  api.get('/organisationUnitSearch', handleWith(OrgUnitSearchHandler));
  api.get('/measures', handleWith(MeasuresHandler));
  api.get('/measureData', handleWith(MeasuresDataHandler));
  api.get('/disasters', catchAsyncErrors(disasters));
  api.get('/projects', catchAsyncErrors(getProjects));
  api.get('/dashboards', handleWith(DashboardsHandler)); // New style dashboards
  api.get('/report/:reportCode', handleWith(ReportHandler));
  api.post('/pdf', catchAsyncErrors(PDFExportHandler));
  api.get('/dashboardItems', handleWith(DashboardItemsHandler));

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
