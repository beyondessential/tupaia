/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */
import '@babel/polyfill';
import { configureEnv } from '../src/configureEnv';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import winston from '../src/log';
import { TaskOverdueChecker } from '../src/scheduledTasks';
import * as modelClasses from '../src/database/models';

configureEnv();

(async () => {
  console.log('STARTING...');
  const start = Date.now();
  const database = new TupaiaDatabase();
  const models = new ModelRegistry(database, modelClasses, true);
  const task = new TaskOverdueChecker(models);
  await task.run();
  const end = Date.now();
  winston.info(`Completed in ${end - start}ms`);
  await database.closeConnections();
})();
