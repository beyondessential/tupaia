/*
 * Tupaia
 *  Copyright (c) 2017 - 2023 Beyond Essential Systems Pty Ltd
 */

import { scheduleJob } from 'node-schedule';
import winston from 'winston';

export class ScheduledTask {
  getSchedule() {
    throw new Error(`ScheduledTask::getSchedule not overridden for ${this.constructor.name}`);
  }

  getName() {
    throw new Error(`ScheduledTask::getName not overridden for ${this.constructor.name}`);
  }

  constructor() {
    winston.info(`Initialising scheduled task ${this.getName()}`);
    this.schedule = this.getSchedule();
    this.name = this.getName();
    this.job = null;
    this.isRunning = false;
    this.start = null;
  }

  // eslint-disable-next-line class-methods-use-this
  async run() {
    throw new Error('Not implemented');
  }

  async runTask() {
    const name = this.getName();
    this.start = Date.now();

    try {
      this.isRunning = true;
      await this.run();
      const durationMs = Date.now() - this.start;
      winston.info(`ScheduledTask: ${name}: Succeeded in ${durationMs}`);
      return true;
    } catch (e) {
      const durationMs = Date.now() - this.start;
      winston.error(`ScheduledTask: ${name}: Failed`, { id: runId, durationMs });
      winston.error(e.stack);

      return false;
    } finally {
      this.start = null;
      this.isRunning = false;
    }
  }

  beginPolling() {
    if (!this.job) {
      const name = this.getName();
      winston.info(`ABC ScheduledTask: ${name}: Scheduled for ${this.schedule}`);
      this.job = scheduleJob(this.schedule, async () => {
        await this.runTask();
      });
    }
  }

  cancelPolling() {
    if (this.job) {
      this.job.cancel();
      this.job = null;
      winston.info(`ScheduledTask: ${this.getName()}: Cancelled`);
    }
  }
}
