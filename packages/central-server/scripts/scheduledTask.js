import '@babel/polyfill';
import { configureEnv } from '../src/configureEnv';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import winston from '../src/log';
import { RepeatingTaskDueDateHandler, TaskOverdueChecker } from '../src/scheduledTasks';
import * as modelClasses from '../src/database/models';

const SCHEDULED_TASK_MODULES = {
  TaskOverdueChecker,
  RepeatingTaskDueDateHandler,
};

configureEnv();

const getTaskArg = argv => {
  const taskAgr = argv[4];
  if (!taskAgr || !Object.keys(SCHEDULED_TASK_MODULES).find(t => t === taskAgr)) {
    const availableOptions = Object.keys(SCHEDULED_TASK_MODULES).join(', ');
    throw new Error(`You need to specify one of the following tasks to run: ${availableOptions}`);
  }

  return argv[4];
};

(async () => {
  const database = new TupaiaDatabase();
  try {
    winston.info('Starting scheduled task script');
    const start = Date.now();
    const taskArg = getTaskArg(process.argv);
    const taskKey = Object.keys(SCHEDULED_TASK_MODULES).find(t => t === taskArg);
    const taskModule = taskKey && SCHEDULED_TASK_MODULES[taskKey];
    winston.info(`Running ${taskArg} module`);
    const models = new ModelRegistry(database, modelClasses, true);
    const taskInstance = new taskModule(models);
    await taskInstance.run();
    const end = Date.now();
    winston.info(`Completed in ${end - start}ms`);
  } catch (error) {
    winston.error(error.message);
    winston.error(error.stack);
  } finally {
    await database.closeConnections();
  }
})();
