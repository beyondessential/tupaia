/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 */

import '@babel/polyfill';

import {} from 'dotenv/config'; // Load the environment variables into process.env

import http from 'http';
import { TupaiaDatabase, ModelRegistry } from '@tupaia/database';

import { createMeditrakSyncQueue } from './database';
import * as modelClasses from './database/models';
import { startSyncWithDhis } from './dhis';
import { startSyncWithMs1 } from './ms1';
import { startFeedScraper } from './social';
import { createApp } from './app';

import winston from './log';

/**
 * Set up database
 */
const database = new TupaiaDatabase();
const models = new ModelRegistry(database, modelClasses);

/**
 * Set up change handlers e.g. for syncing
 */
createMeditrakSyncQueue(models);

/**
 * Set up actual app with routes etc.
 */
const app = createApp(database, models);

/**
 * Start the server
 */
const port = 8090;
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);

/**
 * Regularly sync data to the aggregation servers
 */
startSyncWithDhis(models);

/**
 * Regularly sync data to MS1
 */
startSyncWithMs1(models);

/**
 * Regularly sync actions that have happened on meditrak with the social feed.
 */
startFeedScraper(models);

/**
 * Notify PM2 that we are ready
 */
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
