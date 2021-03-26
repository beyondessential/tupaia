/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

// import { Express } from 'Orchestration';
import cors from 'cors';
import bodyParser from 'body-parser';
import errorHandler from 'api-error-handler';
import express, { Request, Response, NextFunction } from 'express';
// import {} from '../types/express-orchestrator';
import { sessionCookie } from './sessionCookie';
import { SessionModel } from '../models';

/**
 * Set up express server with middleware,
 */
export function createApp(sessionModel: SessionModel) {
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
  app.use((req: Request, res: Response, next: NextFunction) => {
    req.sessionModel = sessionModel;
    next();
  });

  /**
   * Add all routes to the app
   */

  return app;
}
