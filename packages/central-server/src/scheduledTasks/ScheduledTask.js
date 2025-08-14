import { scheduleJob } from 'node-schedule';
import winston from 'winston';

/**
 * Base class for scheduled tasks. Uses 'node-schedule' for scheduling based on cron tab syntax
 * Subclasses should implement the run method and need to be initialised by instantiating the
 * class and calling init in the central-server index.js file
 */
export class ScheduledTask {
  /**
   * Cron tab config for scheduling the task
   */
  schedule = null;

  /**
   * Name of the task for logging
   */
  name = null;

  /**
   * Holds the scheduled job object for the task
   */
  job = null;

  /**
   * Keeps track of start time for logging
   */
  start = null;

  /**
   * Lock key for database advisory lock
   */
  lockKey = null;

  /**
   * Model registry for database access
   */
  models = null;

  constructor(models, name, schedule) {
    if (!name) {
      throw new Error(`ScheduledTask has no name`);
    }

    if (!schedule) {
      throw new Error(`ScheduledTask ${name} has no schedule`);
    }

    this.name = name;
    this.schedule = schedule;
    this.models = models;
    this.lockKey = name;
    winston.info(`Initialising scheduled task ${this.name}`);
  }

  async run() {
    throw new Error('Any subclass of ScheduledTask must implement the "run" method');
  }

  async runTask() {
    this.start = Date.now();

    try {
      await this.models.wrapInTransaction(async transactingModels => {
        // Acquire a database advisory lock for the transaction
        // Ensures no other server instance can execute its change handler at the same time
        await transactingModels.database.acquireAdvisoryLockForTransaction(this.lockKey);
        await this.run();
        const durationMs = Date.now() - this.start;
        winston.info(`ScheduledTask: ${this.name}: Succeeded in ${durationMs}`);
        return true;
      });
    } catch (e) {
      const durationMs = Date.now() - this.start;
      winston.error(`ScheduledTask: ${this.name}: Failed`, { durationMs });
      winston.error(e.stack);
      return false;
    } finally {
      this.start = null;
    }
  }

  init() {
    if (!this.job) {
      winston.info(`ScheduledTask: ${this.name}: Scheduled for ${this.schedule}`);
      this.job = scheduleJob(this.schedule, async () => {
        await this.runTask();
      });
    }
  }
}
