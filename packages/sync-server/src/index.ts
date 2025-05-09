/**
 * Tupaia
 * Copyright (c) 2017 - 2025 Beyond Essential Systems Pty Ltd
 */

import * as dotenv from 'dotenv';

import http from 'http';

import winston from 'winston';
import { TupaiaDatabase } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createApp } from './app';
import { configureEnv } from './configureEnv';

configureWinston();
configureEnv();

const database = new TupaiaDatabase();

/**
 * Set up app with routes etc.
 */
const app = createApp(database);

/**
 * Start the server
 */
const port = process.env.PORT || 8120;
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);

/**
 * Notify PM2 that we are ready
 * */
if (process.send) {
  process.send('ready');
}
