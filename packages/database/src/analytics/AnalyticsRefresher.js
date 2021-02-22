/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

const REFRESH_DEBOUNCE_TIME = 1000; // wait 1 second after changes before refreshing, to avoid double-up

export class AnalyticsRefresher {
  constructor(database, models) {
    this.database = database;
    this.models = models;
    this.scheduledRefreshTimeout = null;
  }

  listenForChanges() {
    this.changeHandlers = [this.models.answer.addChangeHandler(this.handleAnswerChange)];
  }

  handleAnswerChange = () => {
    return this.scheduleAnalyticsRefresh();
  };

  scheduleAnalyticsRefresh() {
    // clear any previous scheduled rebuild, so that we debounce all changes in the same time period
    if (this.scheduledRefreshTimeout) {
      clearTimeout(this.scheduledRefreshTimeout);
    }

    // schedule the rebuild to happen after an adequate period of debouncing
    this.scheduledRefreshTimeout = setTimeout(this.refreshAnalytics, REFRESH_DEBOUNCE_TIME);
  }

  refreshAnalytics = async () => {
    // remove timeout so any jobs added now get scheduled anew
    this.scheduledRefreshTimeout = null;

    // get the subtrees to delete, then run the delete
    const start = Date.now();
    await this.database.executeSql(
      `SELECT mv$refreshMaterializedView('analytics', 'public', true);`,
    );
    const end = Date.now();
    console.log(`Refreshed analytics table, took: ${end - start}ms`);
  };
}
