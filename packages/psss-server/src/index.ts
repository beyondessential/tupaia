/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import '@babel/polyfill';

import {} from 'dotenv/config'; // Load the environment variables into process.env
import http from 'http';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';

import { createApp } from './app';
import winston from './log';
import * as modelClasses from './models';

/**
 * Set up database
 */
const database = new TupaiaDatabase();
const models = new ModelRegistry(database, modelClasses);

/**
 * Set up app with routes etc.
 */
const app = createApp(models);

/**
 * Start the server
 */
const port = process.env.PORT || 8040;
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);

/**
 * Notify PM2 that we are ready
 * */
if (process.send) {
  process.send('ready');
}
