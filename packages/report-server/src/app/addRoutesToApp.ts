/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import { Express, Response, NextFunction } from 'express';
import { InternalServerError, RespondingError } from '@tupaia/utils';
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
