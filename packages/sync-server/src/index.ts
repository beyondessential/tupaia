/**
 * Tupaia
 * Copyright (c) 2017 - 2025 Beyond Essential Systems Pty Ltd
 */

import * as dotenv from 'dotenv';

import http from 'http';

import winston from 'winston';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { createApp } from './app';
import { configureEnv } from './configureEnv';
import { initializeScheduledTasks } from './scheduledTasks/initializeScheduledTasks';
import { CentralSyncManager } from './sync';
import { SyncServerModelRegistry } from './types';
configureWinston();
configureEnv();

const database = new TupaiaDatabase();
const models = new ModelRegistry(database) as SyncServerModelRegistry;
const config = {
  maxRecordsPerSnapshotChunk: 10000,
  lookupTable: {
    perModelUpdateTimeoutMs: 1000000,
    avoidRepull: false,
  },
};

const syncManager = new CentralSyncManager(database, models, config);

/**
 * Set up app with routes etc.
 */
const app = createApp(database);


initializeScheduledTasks(models, syncManager);

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
