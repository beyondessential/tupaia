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

const syncManager = new CentralSyncManager(models);

/**
 * Set up app with routes etc.
 */
const app = createApp(database, syncManager);

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
