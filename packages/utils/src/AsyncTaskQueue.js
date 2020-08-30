/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

const DEFAULT_DEBOUNCE_TIME = 50; // override for your context using the second construction arg

export class AsyncTaskQueue {
  constructor(batchSize, debounceTime = DEFAULT_DEBOUNCE_TIME) {
    this.batchSize = batchSize;
    this.debounceTime = debounceTime;
    this.unprocessedTasks = [];
    this.isProcessing = false;
  }

  async add(callback) {
    const promise = new Promise(resolve => {
      this.unprocessedTasks.push(async () => {
        const result = await callback();
        resolve(result);
      });
    });
    if (!this.isProcessing) this.processTasks();
    return promise;
  }

  async debounce() {
    const numberOfTasks = this.unprocessedTasks.length;
    if (numberOfTasks >= this.batchSize) {
      return; // no need to debounce if we already have a batch full
    }

    // wait for a little, in case more tasks get added and we can batch them
    await new Promise(resolve => setTimeout(resolve, this.debounceTime));

    // if more tasks were added during the debounce time, debounce again
    if (this.unprocessedTasks.length > numberOfTasks) {
      await this.debounce();
    }
  }

  async processTasks() {
    this.isProcessing = true;
    await this.debounce();
    const tasks = this.unprocessedTasks;
    this.unprocessedTasks = [];
    for (let i = 0; i < tasks.length; i += this.batchSize) {
      const batchOfTasks = tasks.slice(i, i + this.batchSize);
      await Promise.all(batchOfTasks.map(async task => task()));
    }
    if (this.unprocessedTasks.length > 0) {
      this.processTasks();
      return;
    }
    this.isProcessing = false;
  }
}
