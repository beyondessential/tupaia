/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { Express, Request, Response, NextFunction } from 'express';
import { InternalServerError, RespondingError } from '@tupaia/utils';
import { authenticationMiddleware } from '../auth';
import { Route, TestRoute } from '../routes';
import { SingleEntityRoute } from '../routes/hierarchy';
import {
  attachEntityAndHierarchyToRequest,
  attachFormatterToResponse,
} from '../routes/hierarchy/middleware';

const handleWith = <Req extends Request, T extends Route<Req>>(
  RouteClass: new (req: Req, res: Response, next: NextFunction) => T,
) => (req: Req, res: Response, next: NextFunction) => {
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

  /**
   * Entity Request routes
   */
  app.use('/v1/hierarchy/:projectCode/:entityCode', attachEntityAndHierarchyToRequest);
  app.use('/v1/hierarchy/*', attachFormatterToResponse);
  app.get('/v1/hierarchy/:projectCode/:entityCode', handleWith(SingleEntityRoute));

  app.use(handleError);
}
