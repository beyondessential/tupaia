/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import morgan from 'morgan';

import { Authenticator } from '@tupaia/auth';
import { buildBasicBearerAuthMiddleware } from '@tupaia/server-boilerplate';

import { apiV2 } from './apiV2';
import { AdminDisabledAccessPolicyBuilder } from './permissions';

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
   * Access logs
   */
  if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
  }

  /**
   * Add singletons to be attached to req for every route
   */
  const baseAuthenticator = new Authenticator(models);
  const adminDisabledAuthenticator = new Authenticator(models, AdminDisabledAccessPolicyBuilder);
  app.use((req, res, next) => {
    req.database = database;
    req.models = models;
    if (req.query?.disableAdmin) {
      req.authenticator = adminDisabledAuthenticator;
    } else {
      req.authenticator = baseAuthenticator;
    }
    next();
  });

  /**
   * Add the basic authenticator to all routes
   */
  app.use(buildBasicBearerAuthMiddleware('central-server'));
  app.use((req, res, next) => {
    req.userId = req.user.id;
    next();
  });

  /**
   * Add all routes to the app
   */
  app.use('/v2', apiV2);

  return app;
}
