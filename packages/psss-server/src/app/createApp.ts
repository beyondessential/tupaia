/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import { ModelRegistry } from '@tupaia/database';

import { addRoutesToApp } from './addRoutesToApp';
import { PsssRequest } from '../types';

/**
 * Set up express server with middleware,
 */
export function createApp(models: ModelRegistry) {
  const app = express();

  /**
   * Add middleware
   */
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Attach model registry to the request
   */
  app.use((req: PsssRequest, res: Response, next: NextFunction) => {
    req.models = models;
    next();
  });

  /**
   * Add all routes to the app
   */
  addRoutesToApp(app);

  return app;
}
