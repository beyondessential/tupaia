/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Multilock } from './Multilock';

const DEBOUNCE_DURATION = 50;

class SupercedableTask {
  constructor(runTask) {
    this.runTask = runTask;
    this.isSuperceded = false;
  }

  supercede() {
    this.isSuperceded = true;
  }

  async run() {
    if (this.isSuperceded) {
      return null;
    }
    return this.runTask();
  }
}

export class DebouncingQueue {
  constructor(debounceDuration) {
    this.debounceDuration = debounceDuration || DEBOUNCE_DURATION;
    this.tasksByHash = {};
    this.lock = new Multilock();
  }

  async runTask(hash, runTask) {
    const existingTask = this.tasksByHash[hash];
    if (existingTask) {
      existingTask.supercede();
    }
    const task = new SupercedableTask(runTask);
    this.tasksByHash[hash] = task;
    await this.lock.waitWithDebounce(this.debounceDuration);
    const unlock = this.lock.createLock();
    const result = await task.run();
    unlock();
    return result;
  }
}
