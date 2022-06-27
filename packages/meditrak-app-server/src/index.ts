/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import * as dotenv from 'dotenv';

import http from 'http';

import winston from 'winston';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { isFeatureEnabled } from '@tupaia/utils';
import { createApp } from './app';
import { MeditrakAppServerModelRegistry } from './types';
import { SyncableChangeEnqueuer } from './sync';

configureWinston();
dotenv.config(); // Load the environment variables into process.env

const database = new TupaiaDatabase();
const models = new ModelRegistry(database) as MeditrakAppServerModelRegistry;

/**
 * Set up app with routes etc.
 */
const app = createApp(database);

/**
 * Set up change handler for the meditrakSyncQueue
 */
if (isFeatureEnabled('SERVER_CHANGE_ENQUEUER')) {
  const syncableChangeEnqueuer = new SyncableChangeEnqueuer(models);
  syncableChangeEnqueuer.listenForChanges();
}

/**
 * Start the server
 */
const port = process.env.PORT || 8020;
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);

/**
 * Notify PM2 that we are ready
 * */
if (process.send) {
  process.send('ready');
}
