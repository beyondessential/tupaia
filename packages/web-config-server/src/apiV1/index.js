/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import apicache from 'apicache';
import { Router } from 'express';

import {
  appSignup,
  appLogin,
  appOneTimeLogin,
  appLogout,
  appChangePassword,
  appRequestResetPassword,
  appGetCountryAccessList,
  appRequestCountryAccess,
  appVerifyEmail,
  appResendEmail,
} from '/appServer';
import { exportChart, ExportSurveyResponsesHandler } from '/export';
import { getUser } from './getUser';
import ViewHandler from './view';
import DashBoardHandler from './dashboard';
import MeasuresHandler from './measures';
import MeasuresDataHandler from './measureData';
import OrgUnitSearchHandler from './organisationUnitSearch';
import OrganisationUnitHandler from './organisationUnit';
import { disasters } from './disasters';

import { getProjects } from './projects';

const handleWith = Handler =>
  catchAsyncErrors((...params) => new Handler(...params).handleRequest());

export const getRoutesForApiV1 = () => {
  const api = Router();
  // mount the routes
  api.get('/getUser', catchAsyncErrors(getUser()));
  api.post('/login', catchAsyncErrors(appLogin()));
  api.post('/login/oneTimeLogin', catchAsyncErrors(appOneTimeLogin()));
  api.post('/signup', catchAsyncErrors(appSignup()));
  api.get('/logout', catchAsyncErrors(appLogout()));
  api.post('/changePassword', catchAsyncErrors(appChangePassword()));
  api.post('/resetPassword', catchAsyncErrors(appRequestResetPassword()));
  api.get('/countryAccessList', catchAsyncErrors(appGetCountryAccessList()));
  api.post('/requestCountryAccess', catchAsyncErrors(appRequestCountryAccess()));
  api.get('/verifyEmail', catchAsyncErrors(appVerifyEmail()));
  api.post('/resendEmail', catchAsyncErrors(appResendEmail()));
  api.post('/export/chart', catchAsyncErrors(exportChart()));
  api.get('/export/surveyResponses', handleWith(ExportSurveyResponsesHandler));
  api.get(
    '/organisationUnit',
    apicache.middleware(process.env.ORGANISATION_UNIT_CACHE_PERIOD),
    handleWith(OrganisationUnitHandler),
  );
  api.get('/organisationUnitSearch', handleWith(OrgUnitSearchHandler));
  api.get('/dashboard', handleWith(DashBoardHandler));
  api.get('/view', handleWith(ViewHandler));
  api.get('/measures', handleWith(MeasuresHandler));
  api.get('/measureData', handleWith(MeasuresDataHandler));
  api.get('/disasters', catchAsyncErrors(disasters));
  api.get('/projects', catchAsyncErrors(getProjects));

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
