import errorHandler from 'api-error-handler';
import bodyParser from 'body-parser';
import cors from 'cors';
import express, { Express, NextFunction, Request, RequestHandler, Response } from 'express';
// @ts-expect-error no types
import morgan from 'morgan';

import {
  AuthHandler,
  getBaseUrlsForHost,
  LOCALHOST_BASE_URLS,
  TupaiaApiClient,
} from '@tupaia/api-client';
import { Authenticator } from '@tupaia/auth';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { TestRoute } from '../../routes';
import { ExpressRequest, Params, Query, ReqBody, ResBody } from '../../routes/Route';
import { ServerBoilerplateModelRegistry } from '../../types';
import { handleError, handleWith, initialiseApiClient } from '../../utils';
import { buildBasicBearerAuthMiddleware } from '../auth';
import { logApiRequest } from '../utils';

export class ApiBuilder {
  private readonly app: Express;
  private readonly models: ServerBoilerplateModelRegistry;
  private readonly apiName: string;
  private version: number;

  private logApiRequestMiddleware: RequestHandler;

  public constructor(transactingConnection: TupaiaDatabase, apiName: string) {
    this.models = new ModelRegistry(transactingConnection) as ServerBoilerplateModelRegistry;
    this.apiName = apiName;
    this.app = express();

    this.version = 1; // Default version
    this.logApiRequestMiddleware = logApiRequest(this.models, this.apiName, this.version);

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
      }) as RequestHandler,
    );
    // @ts-ignore
    // We were previously missing a dev dependency so this TS error never cropped up. This should be
    // tidied up eventually, but leaving for now. (It hasn’t been an issue, yet, for 4+ years)
    this.app.use(bodyParser.json({ limit: '50mb' }));
    // @ts-ignore Same as above
    this.app.use(errorHandler());

    /**
     * Add singletons to be attached to req for every route
     */
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.models = this.models;

      const ctx = {};
      req.ctx = ctx;
      res.ctx = ctx;

      next();
    });
  }

  public setVersion(version: number) {
    this.version = version;
    this.logApiRequestMiddleware = logApiRequest(this.models, this.apiName, this.version);
    return this;
  }

  public useBasicBearerAuth() {
    const authenticator = new Authenticator(this.models);
    this.app.use(buildBasicBearerAuthMiddleware(`${this.apiName}-server`, authenticator));
    return this;
  }

  public attachApiClientToContext(authHandlerProvider: (req: Request) => AuthHandler) {
    return this.use('*', (req, res, next) => {
      try {
        const baseUrls =
          process.env.NODE_ENV === 'test' ? LOCALHOST_BASE_URLS : getBaseUrlsForHost(req.hostname);
        const apiClient = new TupaiaApiClient(authHandlerProvider(req), baseUrls);
        req.ctx.services = apiClient;
        res.ctx.services = apiClient;
        next();
      } catch (err) {
        next(err);
      }
    });
  }

  public async initialiseApiClient(
    permissions: { entityCode: string; permissionGroupName: string }[] = [],
  ) {
    await initialiseApiClient(this.models, permissions);
    return this;
  }

  public use<T extends ExpressRequest<T> = Request>(
    path: string,
    ...middlewares: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.app.use(this.formatPath(path), ...middlewares);
    return this;
  }

  // To add a custom middleware without a path
  public useMiddleware<T extends ExpressRequest<T> = Request>(middleware: RequestHandler) {
    this.app.use(middleware);
    return this;
  }

  public get<T extends ExpressRequest<T> = Request>(
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    return this.addRoute('get', path, ...handlers);
  }

  public post<T extends ExpressRequest<T> = Request>(
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    return this.addRoute('post', path, ...handlers);
  }

  public put<T extends ExpressRequest<T> = Request>(
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    return this.addRoute('put', path, ...handlers);
  }

  public delete<T extends ExpressRequest<T> = Request>(
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    return this.addRoute('delete', path, ...handlers);
  }

  private addRoute<T extends ExpressRequest<T> = Request>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.app[method](
      this.formatPath(path),
      this.logApiRequestMiddleware as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
      ...handlers,
    );
    return this;
  }

  public build() {
    /**
     * Test Route
     */
    this.get('test', handleWith(TestRoute));

    this.app.use(handleError);
    return this.app;
  }

  private formatPath(path: string) {
    return `/v${this.version}/${path}`;
  }
}
