/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import express, { Response, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';

import { addRoutesToApp } from './addRoutesToApp';
import { PsssRequest } from '../types';
import { PsssSessionModel } from '../models';

/**
 * Set up express server with middleware,
 */
export function createApp(sessionModel: PsssSessionModel) {
  const app = express();

  /**
   * Add middleware
   */
  app.use(cors());
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(errorHandler());

  /**
   * Attach psss session model to the request
   */
  app.use((req: PsssRequest, res: Response, next: NextFunction) => {
    req.sessionModel = sessionModel;
    next();
  });

  /**
   * Add all routes to the app
   */
  addRoutesToApp(app);

  return app;
}
