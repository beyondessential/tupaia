/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

const MAX_RETRY_ATTEMPTS = 3;

export class ChangeHandler {
  /**
   * A map of change translators by record type. Each translator can alter the change details that
   * are queued and scheduled for handling at a later stage, when changes stop coming through.
   *
   * @protected
   * @type {Record<string, Function>}
   */
  changeTranslators = {};

  /**
   * Wait 1 sec after changes before handling the change queue, to avoid double-up.
   * Can override in child classes to fine-tune the timing of queue handling
   *
   * @protected
   */
  debounceTime = 1000; // ms

  changeQueue = [];

  scheduledTimeout = null;

  scheduledPromise = null;

  scheduledPromiseResolve = null;

  activePromise = null;

  changeHandlerCancellers = [];

  lockKey = null;

  /**
   * @param {ModelRegistry} models
   * @param {string} lockKey
   */
  constructor(models, lockKey) {
    this.models = models;
    this.lockKey = lockKey;
  }

  setDebounceTime(debounceTime) {
    this.debounceTime = debounceTime;
  }

  /**
   * @abstract
   * @protected
   */
  // eslint-disable-next-line no-unused-vars
  async handleChanges(transactingModels, changes) {
    throw new Error('Any subclass of ChangeHandler must implement the "handleChanges" method');
  }

  /**
   * @protected
   */
  getChangeDebuggingInfo = changes => {
    return `Change count: ${changes.length}`;
  };

  listenForChanges() {
    if (Object.values(this.changeTranslators).length === 0) {
      throw new Error('No change translators found');
    }

    this.changeHandlerCancellers = Object.entries(this.changeTranslators).map(
      ([recordType, translator]) =>
        this.models[recordType].addChangeHandler(async changeDetails => {
          // Translate changes and schedule their handling as a batch at a later stage
          const translatedChanges = await translator(changeDetails);
          this.changeQueue.push(...translatedChanges);
          return this.scheduleChangeQueueHandler();
        }),
    );
  }

  stopListeningForChanges() {
    this.changeHandlerCancellers.forEach(c => c());
    this.changeHandlerCancellers = [];
  }

  async scheduleChangeQueueHandler() {
    // wait for any active handler to finish before scheduling a new one
    await this.activePromise;

    // clear any previous scheduled handler, so that we debounce all changes in the same time period
    if (this.scheduledTimeout) {
      clearTimeout(this.scheduledTimeout);
    }

    if (!this.scheduledPromise) {
      this.scheduledPromise = new Promise(resolve => {
        this.scheduledPromiseResolve = resolve;
      });
    }

    // schedule the handler to execute after an adequate period of debouncing
    this.scheduledTimeout = setTimeout(() => {
      this.activePromise = this.executeScheduledHandler();
    }, this.debounceTime);

    return this.scheduledPromise;
  }

  executeScheduledHandler = async () => {
    // remove timeout so any changes added now get scheduled anew
    this.scheduledTimeout = null;
    this.scheduledPromise = null;

    const currentQueue = this.changeQueue;
    this.changeQueue = [];

    let success;
    for (let i = 0; i < MAX_RETRY_ATTEMPTS; i++) {
      success = true;

      try {
        await this.models.wrapInTransaction(async transactingModels => {
          // Acquire a database advisory lock for the transaction
          // Ensures no other server instance can execute its change handler at the same time
          await transactingModels.database.acquireAdvisoryLockForTransaction(this.lockKey);
          await this.handleChanges(transactingModels, currentQueue);
        });
      } catch (error) {
        winston.warn(
          [
            `Attempt #${i + 1} to handle change batch failed with error message:`,
            error.message,
          ].join('\n'),
        );
        success = false;
      }

      if (success) {
        break;
      }
    }

    if (!success) {
      this.logFailedChanges(currentQueue);
    }
    this.scheduledPromiseResolve();
  };

  logFailedChanges = failedChanges => {
    winston.error(
      [
        `Failed to handle change batch after trying ${MAX_RETRY_ATTEMPTS} times`,
        'Debugging info:',
        this.getChangeDebuggingInfo(failedChanges),
      ].join('\n'),
    );
  };
}
