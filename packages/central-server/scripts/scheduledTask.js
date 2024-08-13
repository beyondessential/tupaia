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

const TASKS = {
  TaskOverdueChecker,
};

configureEnv();

const getTaskArg = argv => {
  const taskAgr = argv[4];
  if (!taskAgr || !Object.keys(TASKS).find(t => t === taskAgr)) {
    const availableOptions = Object.keys(TASKS).join(', ');
    console.error(`You need to specify one of the following tasks to run: ${availableOptions}`);
  }

  return argv[4];
};

(async () => {
  console.log('STARTING...');
  const start = Date.now();
  const taskArg = getTaskArg(process.argv);
  const taskKey = Object.keys(TASKS).find(t => t === taskArg);
  const taskModule = taskKey && TASKS[taskKey];
  const database = new TupaiaDatabase();
  const models = new ModelRegistry(database, modelClasses, true);
  const taskInstance = new taskModule(models);
  await taskInstance.run();
  const end = Date.now();
  winston.info(`Completed in ${end - start}ms`);
  await database.closeConnections();
})();
