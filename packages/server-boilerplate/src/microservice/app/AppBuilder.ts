/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';

import { Authenticator } from '@tupaia/auth';
import { ModelRegistry } from '@tupaia/database';

import { handleWith, handleError } from '../../utils';
import { authenticationMiddleware } from '../auth';
import { TestRoute } from '../../routes';
import { MatchingRequest, Params, ReqBody, ResBody, Query } from '../../routes/Route';

export class AppBuilder {
  private readonly app: Express;

  constructor(models: ModelRegistry) {
    this.app = express();

    /**
     * Add middleware
     */
    this.app.use(
      cors({
        origin: true,
        credentials: true, // withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
      }),
    );
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(errorHandler());

    /**
     * Add singletons to be attached to req for every route
     */
    const authenticator = new Authenticator(models);
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.authenticator = authenticator;
      req.models = models;

      const context = {}; // context is shared between request and response
      req.ctx = context;
      res.ctx = context;

      next();
    });

    /**
     * Attach authentication to each endpoint
     */
    this.app.use(authenticationMiddleware);

    /**
     * GET routes
     */
    this.app.get('/v1/test', handleWith(TestRoute));
  }

  use<T extends MatchingRequest<T>>(
    path: string,
    middleware: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
  ) {
    this.app.use(path, middleware);
    return this;
  }

  get<T extends MatchingRequest<T>>(
    path: string,
    handler: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
  ) {
    this.app.get(path, handler);
    return this;
  }

  build() {
    this.app.use(handleError);
    return this.app;
  }
}
