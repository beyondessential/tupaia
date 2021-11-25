/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import morgan from 'morgan';

import { Authenticator } from '@tupaia/auth';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { TupaiaApiClient, getBaseUrlsForHost, LOCALHOST_BASE_URLS } from '@tupaia/api-client';

import { handleWith, handleError } from '../../utils';
import { buildBasicBearerAuthMiddleware } from '../auth';
import { TestRoute } from '../../routes';
import { ExpressRequest, Params, ReqBody, ResBody, Query } from '../../routes/Route';
import { RequestContext } from '../types';

export class ApiBuilder {
  private readonly app: Express;

  private readonly models: ModelRegistry;

  private version: string;

  constructor(transactingConnection: TupaiaDatabase) {
    this.models = new ModelRegistry(transactingConnection);
    this.app = express();

    this.version = 'v[0-9]'; // Default version

    /**
     * Access logs
     */
    if (process.env.NODE_ENV !== 'production') {
      this.app.use(morgan('dev'));
    }
    
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
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.models = this.models;

      const microServiceAuthHandler = {
        getAuthHeader: async () => req.headers.authorization || '',
      };

      const baseUrls = process.env.NODE_ENV === 'test' ? LOCALHOST_BASE_URLS : getBaseUrlsForHost(req.hostname);

      const context: RequestContext = {
        services: new TupaiaApiClient(microServiceAuthHandler, baseUrls),
      };

      // context is shared between request and response
      req.ctx = context;
      res.ctx = context;

      next();
    });
  }

  setVersion(version: string) {
    this.version = version;
  }

  useBasicBearerAuth(apiName: string) {
    const authenticator = new Authenticator(this.models);
    this.app.use(buildBasicBearerAuthMiddleware(apiName, authenticator));
    return this;
  }

  use<T extends ExpressRequest<T> = Request>(
    path: string,
    ...middlewares: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.app.use(this.formatPath(path), ...middlewares);
    return this;
  }

  get<T extends ExpressRequest<T> = Request>(
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.app.get(this.formatPath(path), ...handlers);
    return this;
  }

  post<T extends ExpressRequest<T> = Request>(
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.app.post(this.formatPath(path), ...handlers);
    return this;
  }

  build() {
    /**
     * Test Route
     */
    this.get('test', handleWith(TestRoute));

    this.app.use(handleError);
    return this.app;
  }

  private formatPath(path: string) {
    return `/${this.version}/${path}`;
  }
}
