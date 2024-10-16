/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import morgan from 'morgan';
import { publicIpv4 } from 'public-ip';
import { Authenticator } from '@tupaia/auth';
import { buildBasicBearerAuthMiddleware } from '@tupaia/server-boilerplate';
import { handleError } from './apiV2/middleware';
import { apiV2 } from './apiV2';
/**
 * Set up express server with middleware,
 */
export function createApp(database, models) {
  const app = express();

  // const CONFIG = ['172.31.0.0/16'];
  // Dynamically set trusted proxy
  publicIpv4()
    .then(publicIp => {
      app.set('trust proxy', ['loopback', '172.31.0.0/16', publicIp]);
      console.log(`Server public IP: ${publicIp} is set as a trusted proxy`);
    })
    .catch(err => {
      console.error('Error fetching public IP:', err);
    });
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
  const authenticator = new Authenticator(models);
  app.use((req, res, next) => {
    req.database = database;
    req.models = models;
    req.authenticator = authenticator;
    next();
  });

  /**
   * Add the basic authenticator to all routes
   */
  app.use(buildBasicBearerAuthMiddleware('central-server', authenticator), handleError);
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
