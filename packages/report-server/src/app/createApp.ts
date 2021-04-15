/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import { Authenticator } from '@tupaia/auth';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';
import { buildBasicBearerAuthMiddleware } from '@tupaia/server-boilerplate';

import { addRoutesToApp } from './addRoutesToApp';

import { ReportsRequest } from '../types';

/**
 * Set up express server with middleware,
 */
export function createApp(database: TupaiaDatabase, models: ModelRegistry) {
  const app = express();

  /**
   * Add middleware
   */
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Add singletons to be attached to req for every route
   */
  app.use((req: ReportsRequest, res, next) => {
    req.database = database;
    req.models = models;
    next();
  });

  /**
   * Attach authentication to each endpoint
   */
  app.use(buildBasicBearerAuthMiddleware('report-server', new Authenticator(models)));

  /**
   * Add all routes to the app
   */
  addRoutesToApp(app);

  return app;
}
