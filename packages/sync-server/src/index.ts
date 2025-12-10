import http from 'http';
import winston from 'winston';

import { ModelRegistry, TupaiaDatabase, syncServerModelClasses } from '@tupaia/database';
import { configureWinston } from '@tupaia/server-boilerplate';
import { getEnvVarOrDefault } from '@tupaia/utils';
import { createApp } from './app';
import { configureEnv } from './configureEnv';
import { initializeScheduledTasks } from './scheduledTasks/initializeScheduledTasks';
import { CentralSyncManager } from './sync';
import { SyncServerModelRegistry } from './types';

configureWinston();
configureEnv();

const database = new TupaiaDatabase();
const models = new ModelRegistry(database, syncServerModelClasses) as SyncServerModelRegistry;

const syncManager = new CentralSyncManager(models);

/**
 * Set up app with routes etc.
 */
const app = createApp(database, syncManager);

initializeScheduledTasks(models, syncManager);

/**
 * Start the server
 */
const port = getEnvVarOrDefault('PORT', 8120);
http.createServer(app).listen(port);
winston.info(`Running on port ${port}`);
winston.info(`Logging at ${winston.level} level`);

/**
 * Notify PM2 that we are ready
 * */
if (process.send) {
  process.send('ready');
}
