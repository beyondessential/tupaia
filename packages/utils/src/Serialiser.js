/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Multilock } from './Multilock';

class Task {
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

export class Serialiser {
  constructor() {
    this.taskQueue = [];
    this.tasksByHash = {};
    this.isRunning = false;
    this.lock = new Multilock();
  }

  async runTask(hash, runTask) {
    await this.lock.waitWithDebounce();
    const unlock = this.lock.createLock();
    const existingTask = this.tasksByHash[hash];
    if (existingTask) {
      existingTask.supercede();
    }
    const task = new Task(runTask);
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
