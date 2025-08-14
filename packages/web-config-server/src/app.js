import '@babel/polyfill';
import http from 'http';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { getRoutesForApiV1 } from './apiV1';
import { bindUserSessions } from './authSession';
import { modelClasses } from './models';
import { handleError, logApiRequest } from './utils';
import './log';
import { configureEnv } from './configureEnv';

configureEnv();

export async function createApp() {
  const app = express();

  app.server = http.createServer(app);

  /**
   * Access logs
   */
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan(':method :url :status :req[Authorization]'));
  }

  app.use(compression());

  // Allow all origins
  app.use(
    cors({
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
    }),
  );

  app.disable('etag');

  // Limit max
  app.use(
    bodyParser.json({
      limit: '100kb',
    }),
  );
  app.use(cookieParser());

  // Connect to db
  const database = new TupaiaDatabase();

  // Attach model registry to req, along with the authenticator
  const modelRegistry = new ModelRegistry(database, modelClasses);
  const authenticator = new Authenticator(modelRegistry);
  app.use((req, res, next) => {
    req.models = modelRegistry;
    req.authenticator = authenticator;
    next();
  });

  // Initialise sessions
  bindUserSessions(app);

  // Log api requests
  app.use(logApiRequest(modelRegistry, 'tupaia', 1));

  // API router
  app.use('/api/v1', getRoutesForApiV1());

  // Handle errors
  app.use(handleError);

  return app;
}
