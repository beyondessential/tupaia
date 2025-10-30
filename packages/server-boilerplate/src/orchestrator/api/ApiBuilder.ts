import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import publicIp from 'public-ip';
import {
  AuthHandler,
  getBaseUrlsForHost,
  LOCALHOST_BASE_URLS,
  TupaiaApiClient,
} from '@tupaia/api-client';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { AccessPolicy } from '@tupaia/access-policy';
import { UnauthenticatedError } from '@tupaia/utils';

// @ts-expect-error no types
import morgan from 'morgan';
import { handleWith, handleError, emptyMiddleware, initialiseApiClient } from '../../utils';
import { TestRoute } from '../../routes';
import { LoginRoute, LogoutRoute, OneTimeLoginRoute, RequestResetPasswordRoute } from '../routes';
import { attachSession as defaultAttachSession } from '../session';
import { ExpressRequest, Params, ReqBody, ResBody, Query } from '../../routes/Route';
import { SessionModel } from '../models';
import { buildAttachAccessPolicy, logApiRequest } from '../utils';
import { ServerBoilerplateModelRegistry } from '../../types';
import { sessionCookie } from './sessionCookie';
import { AccessPolicyBuilder } from '@tupaia/auth';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const i18n = require('i18n');

const TRUSTED_PROXIES_INTERVAL = 60000; // 1 minute

export class ApiBuilder {
  private readonly app: Express;
  private readonly database: TupaiaDatabase;
  private readonly models: ServerBoilerplateModelRegistry;
  private readonly apiName: string;

  private attachSession: RequestHandler;
  private logApiRequestMiddleware: RequestHandler;
  private attachVerifyLogin: (req: Request, res: Response, next: NextFunction) => void;
  private verifyAuthMiddleware: RequestHandler;
  private attachAccessPolicy: RequestHandler;
  private loginRoute: typeof LoginRoute;
  private version: number;

  private translatorConfigured = false;

  // We add handlers at the end so that middlewares and initial routes can be set up first
  private handlers: { add: () => void }[] = [];

  public constructor(
    transactingConnection: TupaiaDatabase,
    apiName: string,
  ) {
    this.database = transactingConnection;
    this.models = new ModelRegistry(this.database) as ServerBoilerplateModelRegistry;
    this.apiName = apiName;
    this.version = 1; // Default version
    this.app = express();
    this.loginRoute = LoginRoute;
    this.attachSession = defaultAttachSession;
    this.logApiRequestMiddleware = logApiRequest(this.models, this.apiName, this.version);
    this.attachVerifyLogin = emptyMiddleware;
    this.verifyAuthMiddleware = emptyMiddleware; // Do nothing by default
    this.attachAccessPolicy = buildAttachAccessPolicy(new AccessPolicyBuilder(this.models));

    /**
     * Set trusted proxies
     */
    this.startTrustedProxiesInterval();

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
        exposedHeaders: ['Content-Disposition'], // needed for getting download filename
      }) as unknown as RequestHandler,
    );
    // @ts-ignore
    // We were previously missing a dev dependency so this TS error never cropped up. This should be
    // tidied up eventually, but leaving for now. (It hasn’t been an issue, yet, for 4+ years)
    this.app.use(bodyParser.json({ limit: '50mb' }));
    // @ts-ignore Same as above
    this.app.use(errorHandler());
    this.app.use(sessionCookie());

    /**
     * Add singletons to be attached to req for every route
     */
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      req.models = this.models;
      const context = { apiName: this.apiName }; // context is shared between request and response
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

  public attachLoginRoute(loginRoute: typeof LoginRoute) {
    this.loginRoute = loginRoute;
    return this;
  }

  public useSessionModel(SessionModelClass: new (database: TupaiaDatabase) => SessionModel) {
    const sessionModel = new SessionModelClass(this.database);
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
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
    this.verifyAuthMiddleware = (req: Request, _res: Response, next: NextFunction) => {
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
    this.attachVerifyLogin = (req: Request, _res: Response, next: NextFunction) => {
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

  public async initialiseApiClient(
    permissions: { entityCode: string; permissionGroupName: string }[] = [],
  ) {
    await initialiseApiClient(this.models, permissions);
    return this;
  }

  /**
   * Call the setTrustedProxies function periodically to update the trusted proxies
   * because it's possible for the server's IP address to change while server is running
   */
  private startTrustedProxiesInterval = () => {
    this.setTrustedProxies(); // Call it once immediately
    setInterval(this.setTrustedProxies, TRUSTED_PROXIES_INTERVAL);
  };

  /**
   * Dynamically set trusted proxy so that we can trust the IP address of the client
   */
  private setTrustedProxies = () => {
    const trustedProxyIPs = process.env.TRUSTED_PROXY_IPS
      ? process.env.TRUSTED_PROXY_IPS.split(',').map(ip => ip.trim())
      : [];

    publicIp
      .v4()
      .then(publicIp => {
        this.app.set('trust proxy', ['loopback', ...trustedProxyIPs, publicIp]);
      })
      .catch(err => {
        console.error('Error fetching public IP:', err);
      });
  };

  public use(path: string, ...middleware: RequestHandler[]) {
    this.handlers.push({
      add: () =>
        this.app.use(
          this.formatPath(path),
          this.attachSession,
          this.attachAccessPolicy,
          ...middleware,
        ),
    });
    return this;
  }

  private addRoute<T extends ExpressRequest<T> = Request>(
    method: 'get' | 'post' | 'put' | 'delete',
    path: string,
    ...handlers: RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>[]
  ) {
    this.handlers.push({
      add: () =>
        this.app[method](
          this.formatPath(path),
          this.attachSession as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
          this.attachAccessPolicy as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
          this.verifyAuthMiddleware as RequestHandler<Params<T>, ResBody<T>, ReqBody<T>, Query<T>>,
          this.logApiRequestMiddleware as RequestHandler<
            Params<T>,
            ResBody<T>,
            ReqBody<T>,
            Query<T>
          >,
          ...handlers,
        ),
    });
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

  // To add a custom middleware without a path
  public useMiddleware<T extends ExpressRequest<T> = Request>(middleware: RequestHandler) {
    this.app.use(middleware);
    return this;
  }

  public build() {
    this.app.post(
      this.formatPath('login'),
      this.attachVerifyLogin,
      this.logApiRequestMiddleware,
      this.attachAccessPolicy,
      handleWith(this.loginRoute),
    );
    this.app.post(this.formatPath('logout'), this.logApiRequestMiddleware, handleWith(LogoutRoute));
    this.app.post(
      this.formatPath('login/oneTimeLogin'),
      this.attachVerifyLogin,
      this.logApiRequestMiddleware,
      handleWith(OneTimeLoginRoute),
    );

    this.app.post(
      this.formatPath('requestResetPassword'),
      this.logApiRequestMiddleware,
      handleWith(RequestResetPasswordRoute),
    );

    this.handlers.forEach(handler => handler.add());

    this.app.use(handleError);

    return this.app;
  }

  private formatPath(path: string) {
    return `/v${this.version}/${path}`;
  }
}
