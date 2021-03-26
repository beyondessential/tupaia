/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';

import { Authenticator } from '@tupaia/auth';
import { ModelRegistry } from '@tupaia/database';
import { InternalServerError, RespondingError } from '@tupaia/utils';

import { authenticationMiddleware } from '../auth';
import { Route, TestRoute } from '../../routes';

type ReqOfRoute<T> = T extends Route<infer Req> ? Req : never;
export const handleWith = <T extends { handle: () => Promise<void> }>(
  RouteClass: new (req: ReqOfRoute<T>, res: Response, next: NextFunction) => T,
) => (req: ReqOfRoute<T>, res: Response, next: NextFunction) => {
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

type RouteDef<Req = Request, Res = Response> = {
  method: 'use' | 'get';
  path: string;
  handler: (req: Req, res: Res, next: NextFunction) => void;
};

// type Get = {
//   method: 'get';
//   path: string;
//   handler: (req: Request, res: Response, next: NextFunction) => void;
// };

/**
 * Set up express server with middleware,
 */
export function createApp(models: ModelRegistry, routes: RouteDef[]) {
  const app = express();

  /**
   * Add middleware
   */
  app.use(
    cors({
      origin: true,
      credentials: true, // withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    }),
  );
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Add singletons to be attached to req for every route
   */
  const authenticator = new Authenticator(models);
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.authenticator = authenticator;

    const context = {}; // context is shared between request and response
    req.ctx = context;
    res.ctx = context;

    next();
  });

  /**
   * Attach authentication to each endpoint
   */
  app.use(authenticationMiddleware);

  /**
   * GET routes
   */
  app.get('/v1/test', handleWith(TestRoute));

  /**
   * Add all routes to the app
   */
  routes.forEach(route => {
    app.get(route.path, route.handler);
  });

  app.use(handleError);

  return app;
}
