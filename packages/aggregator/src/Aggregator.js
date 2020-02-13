/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { aggregateResults } from './aggregation';
import { filterAnalyticsResults } from './filterAnalyticsResults';

export class Aggregator {
  constructor(dataBroker) {
    this.dataBroker = dataBroker;
  }

  get dataSourceTypes() {
    return this.dataBroker.getDataSourceTypes();
  }

  processAnalytics = (analytics, aggregationOptions) => {
    const { aggregationType, aggregationConfig, measureCriteria } = aggregationOptions;
    const aggregatedAnalytics = aggregateResults(analytics, aggregationType, aggregationConfig);
    return filterAnalyticsResults(aggregatedAnalytics, measureCriteria);
  };

  async fetchAnalytics(codeInput, fetchOptions, aggregationOptions = {}) {
    const code = Array.isArray(codeInput) ? codeInput : [codeInput];
    const dataSourceSpec = { code, type: this.dataSourceTypes.DATA_ELEMENT };
    const { period } = fetchOptions;
    const { results, metadata } = await this.dataBroker.pull(dataSourceSpec, fetchOptions);

    return {
      results: this.processAnalytics(results, aggregationOptions),
      metadata,
      period,
    };
  }

  async fetchEvents(code, fetchOptions) {
    const dataSourceSpec = { code, type: this.dataSourceTypes.DATA_GROUP };
    return this.dataBroker.pull(dataSourceSpec, fetchOptions);
  }
}
