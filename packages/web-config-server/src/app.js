import {} from 'dotenv/config'; // Load the environment variables into process.env
import '@babel/polyfill';
import http from 'http';
import express from 'express';
import compression from 'compression';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { getRoutesForApiV1 } from './apiV1';
import { bindUserSessions } from './authSession';
import { modelClasses } from './models';
import { handleError, logApiRequest } from './utils';
import './log';
import { initialiseApiClient } from '@tupaia/server-boilerplate';
import morgan from 'morgan';

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

  // Initialise API Client
  await initialiseApiClient(modelRegistry, [
    { entityCode: 'DL', permissionGroupName: 'Public' }, //	Demo Land
    { entityCode: 'FJ', permissionGroupName: 'Public' }, //	Fiji
    { entityCode: 'CK', permissionGroupName: 'Public' }, //	Cook Islands
    { entityCode: 'PG', permissionGroupName: 'Public' }, //	Papua New Guinea
    { entityCode: 'SB', permissionGroupName: 'Public' }, //	Solomon Islands
    { entityCode: 'TK', permissionGroupName: 'Public' }, //	Tokelau
    { entityCode: 'VE', permissionGroupName: 'Public' }, //	Venezuela
    { entityCode: 'WS', permissionGroupName: 'Public' }, //	Samoa
    { entityCode: 'KI', permissionGroupName: 'Public' }, //	Kiribati
    { entityCode: 'TO', permissionGroupName: 'Public' }, //	Tonga
    { entityCode: 'NG', permissionGroupName: 'Public' }, //	Nigeria
    { entityCode: 'VU', permissionGroupName: 'Public' }, //	Vanuatu
    { entityCode: 'AU', permissionGroupName: 'Public' }, //	Australia
    { entityCode: 'PW', permissionGroupName: 'Public' }, //	Palau
    { entityCode: 'TL', permissionGroupName: 'Public' }, //	Timor-Leste
    { entityCode: 'NU', permissionGroupName: 'Public' }, //	Niue
    { entityCode: 'TV', permissionGroupName: 'Public' }, //	Tuvalu
  ]);

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
