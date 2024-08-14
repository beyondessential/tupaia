/*
 * Tupaia
 *  Copyright (c) 2017 - 2024 Beyond Essential Systems Pty Ltd
 */

import { scheduleJob } from 'node-schedule';
import winston from 'winston';

/**
 * Base class for scheduled tasks. Uses 'node-schedule' for scheduling based on cron tab syntax
 * Subclasses should implement the run method and need to be initialised by instantiating the
 * class and calling init in the central-server index.js file
 */
export class ScheduledTask {
  getSchedule() {
    throw new Error(`ScheduledTask::getSchedule not overridden for ${this.constructor.name}`);
  }

  getName() {
    throw new Error(`ScheduledTask::getName not overridden for ${this.constructor.name}`);
  }

  constructor(models, lockKey) {
    winston.info(`Initialising scheduled task ${this.getName()}`);
    this.models = models;
    this.lockKey = lockKey;
    this.schedule = this.getSchedule();
    this.name = this.getName();
    this.job = null;
    this.start = null;
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
      winston.error(`ScheduledTask: ${this.name}: Failed`, { id: runId, durationMs });
      winston.error(e.stack);

      return false;
    } finally {
      this.start = null;
    }
  }

  init() {
    if (!this.job) {
      const name = this.getName();
      winston.info(`ScheduledTask: ${name}: Scheduled for ${this.schedule}`);
      this.job = scheduleJob(this.schedule, async () => {
        await this.runTask();
      });
    }
  }
}
