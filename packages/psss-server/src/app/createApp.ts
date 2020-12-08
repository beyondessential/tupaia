/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';

import { addRoutesToApp } from './addRoutesToApp';
import { sessionCookie } from './sessionCookie';
import { attachSessionModel } from './attachSessionModel';
import { PsssSessionModel } from '../models';

/**
 * Set up express server with middleware,
 */
export function createApp(sessionModel: PsssSessionModel) {
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
  app.use(sessionCookie());
  app.use(attachSessionModel(sessionModel));

  /**
   * Add all routes to the app
   */
  addRoutesToApp(app);

  return app;
}
