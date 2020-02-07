/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Multilock } from './Multilock';

const DEBOUNCE_DURATION = 250;

class SupercedableTask {
  constructor(runTask) {
    this.runTask = runTask;
    this.promise = new Promise(resolve => {
      this.resolve = resolve;
    });
    this.isSuperceded = false;
  }

  supercede() {
    this.isSuperceded = true;
  }

  run() {
    if (this.isSuperceded) {
      this.resolve();
      return null;
    }
    return this.runTask();
  }

  await() {
    return this.promise;
  }
}

export class DebouncingQueue {
  constructor() {
    this.taskQueue = [];
    this.tasksByHash = {};
    this.isRunning = false;
    this.lock = new Multilock();
  }

  async runTask(hash, runTask) {
    await this.lock.waitWithDebounce(DEBOUNCE_DURATION);
    const unlock = this.lock.createLock();
    const existingTask = this.tasksByHash[hash];
    if (existingTask) {
      existingTask.supercede();
    }
    const task = new SupercedableTask(runTask);
    this.tasksByHash[hash] = task;
    this.addToQueue(task);
    unlock();
    return task.await();
  }

  addToQueue(task) {
    this.taskQueue.push(task);
    if (!this.isRunning) this.runNextTask();
  }

  async runNextTask() {
    this.isRunning = true;
    const task = this.taskQueue.shift();
    await task.run();
    if (this.taskQueue.length > 0) this.runNextTask();
    else this.isRunning = false;
  }
}
