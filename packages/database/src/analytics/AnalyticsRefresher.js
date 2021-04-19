/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';

const REFRESH_DEBOUNCE_TIME = 1000; // wait 1 second after changes before refreshing, to avoid double-up

export class AnalyticsRefresher {
  constructor(database, models) {
    this.database = database;
    this.models = models;
    this.scheduledRefreshTimeout = null;
    this.scheduledRefreshPromise = null;
    this.scheduledRefreshPromiseResolve = null;
    this.changeHandlerCancellers = [];
  }

  listenForChanges() {
    this.changeHandlerCancellers = [this.models.answer.addChangeHandler(this.handleAnswerChange)];
  }

  stopListeningForChanges() {
    this.changeHandlerCancellers.forEach(c => c());
    this.changeHandlerCancellers = [];
  }

  handleAnswerChange = () => {
    return this.scheduleAnalyticsRefresh();
  };

  scheduleAnalyticsRefresh() {
    // clear any previous scheduled rebuild, so that we debounce all changes in the same time period
    if (this.scheduledRefreshTimeout) {
      clearTimeout(this.scheduledRefreshTimeout);
    }

    if (!this.scheduledRefreshPromise) {
      this.scheduledRefreshPromise = new Promise(resolve => {
        this.scheduledRefreshPromiseResolve = resolve;
      });
    }

    // schedule the rebuild to happen after an adequate period of debouncing
    this.scheduledRefreshTimeout = setTimeout(this.refreshAnalytics, REFRESH_DEBOUNCE_TIME);
    return this.scheduledRefreshPromise;
  }

  refreshAnalytics = async () => {
    // remove timeout so any jobs added now get scheduled anew
    const existingResolve = this.scheduledRefreshPromiseResolve;
    this.scheduledRefreshTimeout = null;
    this.scheduledRefreshPromise = null;

    // get the subtrees to delete, then run the delete
    await AnalyticsRefresher.executeRefresh(this.database);
    existingResolve();
  };

  static async executeRefresh(database) {
    try {
      const start = Date.now();
      await database.executeSql(`SELECT mv$refreshMaterializedView('analytics', 'public', true);`);
      const end = Date.now();
      winston.info(`Analytics table refresh took: ${end - start}ms`);
    } catch (error) {
      winston.error(`Analytics table refresh failed: ${error.message}`);
    }
  }
}
