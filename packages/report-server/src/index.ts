/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import http from 'http';
import path from 'path';

import winston from 'winston';

import { configureWinston } from '@tupaia/server-boilerplate';
import { configureDotEnv } from '@tupaia/server-utils';
import { createApp } from './app';

configureWinston();
configureDotEnv([
  path.resolve(__dirname, '../../../env/aggregation.env'),
  path.resolve(__dirname, '../../../env/dhis.env'),
  path.resolve(__dirname, '../../../env/data-lake.env'),
  path.resolve(__dirname, '../../../env/superset.env'),
  path.resolve(__dirname, '../../../env/servers.env'),
  path.resolve(__dirname, '../../../env/db.env'),
  path.resolve(__dirname, '../../../env/api-client.env'),
  path.resolve(__dirname, '../.env'),
]); // Load the environment variables into process.env

(async () => {
  /**
   * Set up app with routes etc.
   */
  const app = await createApp();

  /**
   * Start the server
   */
  const port = process.env.PORT || 8030;
  http.createServer(app).listen(port);
  winston.info(`Running on port ${port}`);

  /**
   * Notify PM2 that we are ready
   * */
  if (process.send) {
    process.send('ready');
  }
})();
