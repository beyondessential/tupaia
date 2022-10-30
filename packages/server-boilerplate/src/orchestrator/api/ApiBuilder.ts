/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import {
  AuthHandler,
  getBaseUrlsForHost,
  LOCALHOST_BASE_URLS,
  TupaiaApiClient,
} from '@tupaia/api-client';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';
import { UnauthenticatedError } from '@tupaia/utils';

import { handleWith, handleError } from '../../utils';
import { TestRoute } from '../../routes';
import { LoginRoute, LoginRequest, LogoutRoute } from '../routes';
import { attachSession as defaultAttachSession } from '../session';
import { ExpressRequest, Params, ReqBody, ResBody, Query } from '../../routes/Route';
import { sessionCookie } from './sessionCookie';
import { SessionModel } from '../models';
import { logApiRequest } from '../utils';
import { ServerBoilerplateModelRegistry } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const i18n = require('i18n');

export class ApiBuilder {
  private readonly app: Express;
  private readonly database: TupaiaDatabase;
  private readonly models: ServerBoilerplateModelRegistry;
  private readonly apiName: string;

  private attachSession: RequestHandler;
  private logApiRequestMiddleware: RequestHandler;
  private attachVerifyLogin?: (req: LoginRequest, res: Response, next: NextFunction) => void;
  private verifyAuthMiddleware?: RequestHandler;
  private version: number;

  private translatorConfigured = false;

  public constructor(transactingConnection: TupaiaDatabase, apiName: string) {
    this.database = transactingConnection;
    this.models = new ModelRegistry(this.database) as ServerBoilerplateModelRegistry;
    this.apiName = apiName;
    this.version = 1; // Default version
    this.app = express();
    this.attachSession = defaultAttachSession;
    this.logApiRequestMiddleware = logApiRequest(this.models, this.apiName, this.version);

    /**
     * Add middleware
     */
    this.app.use(
      cors({
        origin: true,
        credentials: true, // withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
        exposedHeaders: ['Content-Disposition'], // needed for getting download filename
      }),
    );
    this.app.use(bodyParser.json({ limit: '50mb' }));
    this.app.use(errorHandler());
    this.app.use(sessionCookie());

    /**
     * Add singletons to be attached to req for every route
     */
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const context = {}; // context is shared between request and response
      req.ctx = context;
      res.ctx = context;

      next();
    });

    /**
     * Test Route
     */
    this.app.get(this.formatPath('test'), handleWith(TestRoute));
  }

  public setVersion(version: number) {
    this.version = version;
    this.logApiRequestMiddleware = logApiRequest(this.models, this.apiName, this.version);
    return this;
  }

  public logApiRequests() {
    if (!this.apiName) {
      throw new Error('Must set apiName in order to log api requests');
    }
    this.logApiRequestMiddleware = logApiRequest(this.models, this.apiName, this.version);
    return this;
  }

  public useAttachSession(attachSession: RequestHandler) {
    this.attachSession = attachSession;
    return this;
  }

  public useSessionModel(SessionModelClass: new (database: TupaiaDatabase) => SessionModel) {
    const sessionModel = new SessionModelClass(this.database);
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.sessionModel = sessionModel;
      next();
    });
    return this;
  }

  public useTranslation(locales: string[], directory: string, queryParameter: string) {
    // Configure only once
    if (!this.translatorConfigured) {
      i18n.configure({
        locales,
        directory,
        queryParameter,
        objectNotation: true, // Allow locale files to use x.y notation
        updateFiles: false, // Don't update locale files while running
        api: {
          // Rename translation functions
          __: 'translate',
          __n: 'translaten',
        },
      });
      this.translatorConfigured = true;
    }
    // Add translation to req/res locals
    this.app.use(i18n.init);
    return this;
  }

  public verifyAuth(verify: (accessPolicy: AccessPolicy) => void) {
    this.verifyAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
      try {
        const { session } = req;
        if (!session) {
          throw new UnauthenticatedError('Session not attached to request');
        }

        verify(session.accessPolicy);

        next();
      } catch (error) {
        next(error);
      }
    };
    return this;
  }

  public verifyLogin(verify: (accessPolicy: AccessPolicy) => void) {
    this.attachVerifyLogin = (req: LoginRequest, res: Response, next: NextFunction) => {
      req.ctx.verifyLogin = verify;
      next();
    };
    return this;
  }

  public attachApiClientToContext(authHandlerProvider: (req: Request) => AuthHandler) {
    this.app.use((req, res, next) => {
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

    return this;
  }

  public use<T extends ExpressRequest<T> = Request>(
    path: string,
    ...middleware: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.app.use(
      this.formatPath(path),
      this.attachSession as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
      ...middleware,
    );
    return this;
  }

  private addRoute<T extends ExpressRequest<T> = Request>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    if (this.verifyAuthMiddleware) {
      this.app[method](
        this.formatPath(path),
        this.attachSession as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
        this.verifyAuthMiddleware as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
        this.logApiRequestMiddleware as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
        ...handlers,
      );
    } else {
      this.app[method](
        this.formatPath(path),
        this.attachSession as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
        this.logApiRequestMiddleware as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
        ...handlers,
      );
    }
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

  public build() {
    if (this.attachVerifyLogin) {
      this.app.post(
        this.formatPath('login'),
        this.attachVerifyLogin,
        this.logApiRequestMiddleware,
        handleWith(LoginRoute),
      );
    } else {
      this.app.post(this.formatPath('login'), this.logApiRequestMiddleware, handleWith(LoginRoute));
    }
    this.app.post(this.formatPath('logout'), this.logApiRequestMiddleware, handleWith(LogoutRoute));

    this.app.use(handleError);
    return this.app;
  }

  private formatPath(path: string) {
    return `/v${this.version}/${path}`;
  }
}
