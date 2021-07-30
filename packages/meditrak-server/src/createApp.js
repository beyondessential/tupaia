/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';

import { Authenticator } from '@tupaia/auth';

import { apiV2 } from './apiV2';

/**
 * Set up express server with middleware,
 */
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
   */
  const authenticator = new Authenticator(models);
  app.use((req, res, next) => {
    req.database = database;
    req.models = models;
    req.authenticator = authenticator;
    next();
  });

  /**
   * Add all routes to the app
   */
  app.use('/v2', apiV2);

  return app;
}
