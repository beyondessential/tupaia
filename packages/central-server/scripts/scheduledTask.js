import { parseArgs } from 'node:util';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { configureEnv } from '../src/configureEnv';
import * as modelClasses from '../src/database/models';
import winston from '../src/log';
import { RepeatingTaskDueDateHandler, TaskOverdueChecker } from '../src/scheduledTasks';

const SCHEDULED_TASK_MODULES = /** @type {const} */ ({
  TaskOverdueChecker,
  RepeatingTaskDueDateHandler,
});

const disjunctionFormatter = new Intl.ListFormat('en-AU', { type: 'disjunction' });

configureEnv();

class UsageError extends Error {
  constructor(...args) {
    super(...args);
    this.name = 'UsageError';
  }
}

const getTaskArg = () => {
  const {
    positionals: [taskArg],
  } = parseArgs({ allowPositionals: true });
  if (!Object.hasOwn(SCHEDULED_TASK_MODULES, taskArg)) {
    const availableOptions = disjunctionFormatter.format(Object.keys(SCHEDULED_TASK_MODULES));
    throw new UsageError(`Specify a task to run: ${availableOptions}`);
  }

  return taskArg;
};

(async () => {
  const profiler = winston.startTimer();
  const database = new TupaiaDatabase();
  try {
    winston.info('Starting scheduled task script');
    const taskArg = getTaskArg();
    const TaskModule = SCHEDULED_TASK_MODULES[taskArg];
    winston.info(`Running ${taskArg} module`);
    const models = new ModelRegistry(database, modelClasses, true);
    const taskInstance = new TaskModule(models);
    await taskInstance.run();
    profiler.done({ message: 'Done' });
  } catch (error) {
    winston.error(error.message);
    winston.error(error.stack);
    profiler.done({ message: 'Failed' });
  } finally {
    await database.closeConnections();
  }
})();
