import '@babel/polyfill';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { parseArgs } from 'node:util';
import { configureEnv } from '../src/configureEnv';
import * as modelClasses from '../src/database/models';
import winston from '../src/log';
import { RepeatingTaskDueDateHandler, TaskOverdueChecker } from '../src/scheduledTasks';

const SCHEDULED_TASK_MODULES = /** @type {const} */ ({
  TaskOverdueChecker,
  RepeatingTaskDueDateHandler,
});

configureEnv();

const getTaskArg = () => {
  const {
    positionals: [taskArg],
  } = parseArgs({ allowPositionals: true });
  if (!Object.hasOwn(SCHEDULED_TASK_MODULES, taskArg)) {
    const availableOptions = Object.keys(SCHEDULED_TASK_MODULES).join(', ');
    throw new Error(`You need to specify one of the following tasks to run: ${availableOptions}`);
  }

  return taskArg;
};

(async () => {
  const database = new TupaiaDatabase();
  try {
    winston.info('Starting scheduled task script');
    const profiler = winston.startTimer();
    const taskArg = getTaskArg();
    const TaskModule = SCHEDULED_TASK_MODULES[taskArg];
    winston.info(`Running ${taskArg} module`);
    const models = new ModelRegistry(database, modelClasses, true);
    const taskInstance = new TaskModule(models);
    await taskInstance.run();
    profiler.done({ message: 'Completed' });
  } catch (error) {
    winston.error(error.message);
    winston.error(error.stack);
  } finally {
    await database.closeConnections();
  }
})();
