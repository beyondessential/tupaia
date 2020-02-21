/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { aggregateAnalytics, filterAnalytics } from './analytics';
import { AGGREGATION_TYPES } from './aggregationTypes';

export class Aggregator {
  static aggregationTypes = AGGREGATION_TYPES;

  constructor(dataBroker) {
    this.dataBroker = dataBroker;
  }

  // eslint-disable-next-line class-methods-use-this
  get aggregationTypes() {
    return Aggregator.aggregationTypes;
  }

  get dataSourceTypes() {
    return this.dataBroker.getDataSourceTypes();
  }

  processAnalytics = (analytics, aggregationOptions) => {
    const { aggregationType, aggregationConfig, measureCriteria } = aggregationOptions;
    const aggregatedAnalytics = aggregateAnalytics(analytics, aggregationType, aggregationConfig);
    return filterAnalytics(aggregatedAnalytics, measureCriteria);
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

  async fetchDataElements(codes, fetchOptions) {
    const dataSourceSpec = { code: codes, type: this.dataSourceTypes.DATA_ELEMENT };
    return this.dataBroker.pullMetadata(dataSourceSpec, fetchOptions);
  }
}
