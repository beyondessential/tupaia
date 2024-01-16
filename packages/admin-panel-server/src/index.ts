/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import http from 'http';
import * as dotenv from 'dotenv';

import winston from 'winston';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createApp } from './app';

configureWinston();
dotenv.config(); // Load the environment variables into process.env

(async () => {
  /**
   * Set up app with routes etc.
   */
  const app = await createApp();

  /**
   * Start the server
   */
  const port = process.env.PORT || 8070;
  http.createServer(app).listen(port);
  winston.info(`Running on port ${port}`);

  /**
   * Notify PM2 that we are ready
   * */
  if (process.send) {
    process.send('ready');
  }
})();
