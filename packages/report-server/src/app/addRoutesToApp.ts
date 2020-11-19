/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Express, Response, NextFunction } from 'express';
import { InternalServerError } from '@tupaia/utils';
import { fetchReport } from '../routes';
import { authenticationMiddleware } from '../auth';
import { ReportsRequest } from '../types';

/**
 * All routes will be wrapped with an error catcher that simply passes the error to the next()
 * function, causing error handling middleware to be fired. Otherwise, async errors will be
 * swallowed.
 */
const wrappedFetchReportWithAsyncCatch = (
  req: ReportsRequest,
  res: Response,
  next: NextFunction,
) => {
  const reportPromise = fetchReport(req, res);
  reportPromise.catch(error => next(error));
  return reportPromise;
};

export function addRoutesToApp(app: Express) {
  /**
   * Attach authentication to each endpoint
   */
  app.use(authenticationMiddleware);

  /**
   * POST routes
   */
  app.post('(/v[0-9]+)?/fetchReport/:reportCode', wrappedFetchReportWithAsyncCatch);

  app.use(handleError);
}

const handleError = (err, req: ReportsRequest, res: Response) => {
  let error = err;
  if (!error.respond) {
    error = new InternalServerError(err);
  }
  error.respond(res);
};
