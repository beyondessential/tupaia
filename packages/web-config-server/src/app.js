import {} from 'dotenv/config'; // Load the environment variables into process.env
import '@babel/polyfill';
import http from 'http';
import express from 'express';
import compression from 'compression';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { TupaiaDatabase, ModelRegistry, EntityHierarchyCacher } from '@tupaia/database';
import { Authenticator } from '@tupaia/auth';
import { getRoutesForApiV1 } from './apiV1';
import { bindUserSessions } from './authSession';
import { BaseModel } from './models/BaseModel';
import { handleError } from './utils';

import './log';
import winston from 'winston';

export async function createApp() {
  const app = express();

  app.server = http.createServer(app);
  // Uncomment to log out incoming requests
  // app.use(morgan('dev'));

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

  // Pre-cache entity hierarchy details
  const entityHierarchyCacher = new EntityHierarchyCacher(database);
  await entityHierarchyCacher.buildAndCacheAll();

  // Attach database to legacy singleton models
  BaseModel.database = database;

  // Attach newer model registry to req, along with the authenticator
  const modelRegistry = new ModelRegistry(database);
  const authenticator = new Authenticator(modelRegistry);
  app.use((req, res, next) => {
    req.models = modelRegistry;
    req.authenticator = authenticator;
    next();
  });

  // Initialise sessions
  bindUserSessions(app);

  // API router
  app.use('/api/v1', getRoutesForApiV1());

  // Handle errors
  app.use(handleError);

  return app;
}
