/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';

import { Authenticator } from '@tupaia/auth';
import { EntityServerModelRegistry } from '../types';

import { addRoutesToApp } from './addRoutesToApp';

/**
 * Set up express server with middleware,
 */
export function createApp(models: EntityServerModelRegistry) {
  const app = express();

  /**
   * Add middleware
   */
  app.use(
    cors({
      origin: true,
      credentials: true, // withCredentials needs to be set for cookies to save @see https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    }),
  );
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Add singletons to be attached to req for every route
   */
  const authenticator = new Authenticator(models);
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.models = models;
    req.authenticator = authenticator;

    const context = {}; // context is shared between request and response
    req.context = context;
    res.context = context;

    next();
  });

  /**
   * Add all routes to the app
   */
  addRoutesToApp(app);

  return app;
}
