/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Express, Request, Response, NextFunction } from 'express';
import { InternalServerError, RespondingError } from '@tupaia/utils';
import { PsssRequest } from '../types';
import { LoginHandler, LogoutHandler, TestHandler } from '../routes';
import { RouteHandler } from '../routes/RouteHandler';

const handleWith = (Handler: typeof RouteHandler) => (
  req: PsssRequest,
  res: Response,
  next: NextFunction,
) => {
  const handler = new Handler(req, res, next);
  return handler.handle();
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
   * GET routes
   */
  app.get('/v1/test', handleWith(TestHandler));

  /**
   * POST routes
   */
  app.post('/v1/login', handleWith(LoginHandler));
  app.post('/v1/logout', handleWith(LogoutHandler));

  app.use(handleError);
}
