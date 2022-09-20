/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import winston from 'winston';
import { ChangeHandler } from './ChangeHandler';

export class AnalyticsRefresher extends ChangeHandler {
  debounceTime = 1000;

  constructor(models) {
    super(models, 'analytics-refresher');

    this.changeTranslators = {
      answer: () => [],
      surveyResponse: () => [],
      survey: () => [],
      entity: () => [],
      question: () => [],
      dataElement: () => [],
    };
  }

  static refreshAnalytics = async database => {
    try {
      const start = Date.now();
      await database.executeSql(`SELECT mv$refreshMaterializedView('analytics', 'public', true);`);
      const end = Date.now();
      winston.info(`Analytics table refresh took: ${end - start}ms`);
    } catch (error) {
      winston.error(`Analytics table refresh failed: ${error.message}`);
    }
  };

  handleChanges(transactingModels) {
    return AnalyticsRefresher.refreshAnalytics(transactingModels.database);
  }
}
