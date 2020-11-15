/**
 * Reports package
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import { Authenticator } from '@tupaia/auth';

import { addRoutesToApp } from './addRoutesToApp';

import { ReportsRequest } from '../types';

/**
 * Set up express server with middleware,
 **/
export function createApp(database, models) {
  const app = express();

  /**
   * Add middleware
   */
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Add singletons to be attached to req for every route
   **/
  const authenticator = new Authenticator(models);
  app.use((req: ReportsRequest, res, next) => {
    req.database = database;
    req.models = models;
    req.authenticator = authenticator;
    next();
  });

  /**
   * Add all routes to the app
   */
  addRoutesToApp(app);

  return app;
}
