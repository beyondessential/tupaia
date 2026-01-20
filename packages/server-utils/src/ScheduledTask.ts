import { Knex } from 'knex';
import { Job, scheduleJob } from 'node-schedule';
import winston from 'winston';

export interface DatabaseInterface {
  /**
   * Wraps a callback in a database transaction
   * @param callback Function to execute within the transaction
   * @returns Promise that resolves when the transaction is complete
   */
  wrapInTransaction<T>(
    callback: (transactingModels: DatabaseInterface) => Promise<T | void>,
    transactionConfig?: Knex.TransactionConfig,
  ): Promise<T | void>;

  /**
   * Database instance with advisory lock functionality
   */
  database: {
    /**
     * Acquires an advisory lock for the current transaction
     * @param lockKey Unique key for the lock
     */
    acquireAdvisoryLock(lockKey: string): Promise<void>;
  };
}

/**
 * Base class for scheduled tasks. Uses 'node-schedule' for scheduling based on cron tab syntax
 * Subclasses should implement the run method and need to be initialised by instantiating the
 * class and calling init in the central-server index.js file
 */
export abstract class ScheduledTask {
  /**
   * Cron tab config for scheduling the task
   */
  schedule: string;

  /**
   * Name of the task for logging
   */
  name: string;

  /**
   * Holds the scheduled job object for the task
   */
  job: Job | null = null;

  /**
   * Keeps track of start time for logging
   */
  start: number | null = null;

  /**
   * Lock key for database advisory lock
   */
  lockKey: string;

  /**
   * Model registry for database access
   */
  models: DatabaseInterface;

  isRunning = false;

  constructor(models: DatabaseInterface, name: string, schedule: string) {
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

  abstract run(): Promise<void>;

  async runTask() {
    this.start = Date.now();

    if (this.isRunning) {
      const durationMs = Date.now() - this.start;
      winston.info(`ScheduledTask: ${this.name}: Not running (previous task still running)`, {
        durationMs,
      });
      return false;
    }

    try {
      this.isRunning = true;
      await this.models.wrapInTransaction(async (transactingModels: DatabaseInterface) => {
        // Acquire a database advisory lock for the transaction
        // Ensures no other server instance can execute its change handler at the same time
        await transactingModels.database.acquireAdvisoryLock(this.lockKey);
        await this.run();
        const durationMs = Date.now() - (this.start as number);
        winston.info(`ScheduledTask: ${this.name}: Succeeded in ${durationMs}`);
        return true;
      });
    } catch (e: any) {
      const durationMs = Date.now() - this.start;
      winston.error(`ScheduledTask: ${this.name}: Failed`, { durationMs });
      winston.error(e.stack);
      return false;
    } finally {
      this.start = null;
      this.isRunning = false;
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
