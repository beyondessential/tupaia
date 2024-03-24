/**
 * Tupaia
 * Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import * as dotenv from 'dotenv';
import path from 'path';
import http from 'http';

import winston from 'winston';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createApp } from './app';

configureWinston();

dotenv.config({
  path: [
    path.resolve(__dirname, '../../../env/.env.servers'),
    path.resolve(__dirname, '../../../env/.env.db'),
    path.resolve(__dirname, '.env'),
  ],
}); // Load the environment variables into process.env from the common .env file and this server's .env file

(async () => {
  /**
   * Set up app with routes etc.
   */
  const app = await createApp();

  /**
   * Start the server
   */
  const port = process.env.PORT || 8110;
  http.createServer(app).listen(port);
  winston.info(`Running on port ${port}`);

  /**
   * Notify PM2 that we are ready
   * */
  if (process.send) {
    process.send('ready');
  }
})();
