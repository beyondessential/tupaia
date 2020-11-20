/**
 * Tupaia
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import '@babel/polyfill';

import {} from 'dotenv/config'; // Load the environment variables into process.env

import http from 'http';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';
// import { Analytic, Builder, FetchOptions, IndicatorType, ModelRegistry } from './types';
import { createApp } from './app';

import winston from './log';

/**
 * Set up database
 */
const database = new TupaiaDatabase();
const models = new ModelRegistry(database);

/**
 * Set up actual app with routes etc.
 */
const app = createApp(database, models);

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
  (async () => {
    try {
      await database.waitForChangeChannel();
      winston.info('Successfully connected to pubsub service');
      process.send('ready');
    } catch (error) {
      winston.error(error.message);
    }
  })();
}
