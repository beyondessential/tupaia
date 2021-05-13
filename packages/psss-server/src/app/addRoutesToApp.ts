/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Express, Request, Response, NextFunction } from 'express';
import { InternalServerError, RespondingError } from '@tupaia/utils';
import { PsssRequest } from '../types';
import {
  LoginRoute,
  LogoutRoute,
  TestRoute,
  FetchAlertsRoute,
  FetchConfirmedWeeklyReportRoute,
  FetchConfirmedCountryWeeklyReportRoute,
  FetchCountries,
  FetchCountrySites,
  FetchCountryWeeklyReportRoute,
  ConfirmCountryWeeklyReportRoute,
  SaveWeeklyReportRoute,
  DeleteWeeklyReportRoute,
} from '../routes';
import { Route } from '../routes/Route';

const handleWith = (RouteClass: typeof Route) => (
  req: PsssRequest,
  res: Response,
  next: NextFunction,
) => {
  const route = new RouteClass(req, res, next);
  return route.handle();
};

const handleError = (
  err: RespondingError | Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // use default if response is already being sent and there are connection problems
  if (res && res.headersSent) {
    next(err);
    return;
  }

  const error = 'respond' in err ? err : new InternalServerError(err);
  error.respond(res);
};

const useSites = (req: Request, res: Response, next: NextFunction) => {
  req.useSites = true;
  next();
};

export function addRoutesToApp(app: Express) {
  /**
   * GET routes
   */
  app.get('/v1/test', handleWith(TestRoute));
  app.get('/v1/alerts/:status', handleWith(FetchAlertsRoute));
  app.get('/v1/confirmedWeeklyReport', handleWith(FetchConfirmedWeeklyReportRoute));
  app.get(
    '/v1/confirmedWeeklyReport/:countryCode',
    handleWith(FetchConfirmedCountryWeeklyReportRoute),
  );
  app.get('/v1/country', handleWith(FetchCountries));
  app.get('/v1/country/:countryCode/sites', handleWith(FetchCountrySites));
  app.get('/v1/weeklyReport/:countryCode', handleWith(FetchCountryWeeklyReportRoute));
  app.get(
    '/v1/weeklyReport/:countryCode/sites',
    useSites,
    handleWith(FetchCountryWeeklyReportRoute),
  );

  /**
   * POST routes
   */
  app.post('/v1/login', handleWith(LoginRoute));
  app.post('/v1/logout', handleWith(LogoutRoute));
  app.post('/v1/confirmedWeeklyReport/:countryCode', handleWith(ConfirmCountryWeeklyReportRoute));

  /**
   * PUT routes
   */
  app.put('/v1/weeklyReport/:countryCode/:siteCode?', handleWith(SaveWeeklyReportRoute));

  /**
   * DELETE routes
   */
  app.delete('/v1/weeklyReport/:countryCode/:siteCode?', handleWith(DeleteWeeklyReportRoute));

  app.use(handleError);
}
