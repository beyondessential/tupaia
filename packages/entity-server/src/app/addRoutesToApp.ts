/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Express, Request, Response, NextFunction } from 'express';
import { InternalServerError, RespondingError } from '@tupaia/utils';
import { TestRoute } from '../routes';
import { Route } from '../routes/Route';
import { authenticationMiddleware } from '../auth';

const handleWith = (RouteClass: typeof Route) => (
  req: Request,
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

export function addRoutesToApp(app: Express) {
  /**
   * Attach authentication to each endpoint
   */
  app.use(authenticationMiddleware);

  /**
   * GET routes
   */
  app.get('/v1/test', handleWith(TestRoute));

  app.use(handleError);
}
