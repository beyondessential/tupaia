/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp, reduceToDictionary } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class AnalyticsPerPeriodBuilder extends DataBuilder {
  async build() {
    this.dataElementToSeriesKey = this.getDataElementToSeriesKey();
    const dataElementCodes = Object.keys(this.dataElementToSeriesKey);
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const resultsPerPeriod = this.getResultsPerPeriod(results);

    return { data: Object.values(resultsPerPeriod) };
  }

  getDataElementToSeriesKey() {
    const series = this.config.series || [
      { key: 'value', dataElementCode: this.config.dataElementCode },
    ];
    return reduceToDictionary(series, 'dataElementCode', 'key');
  }

  getResultsPerPeriod = results => {
    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, dataElement } = result;
      const seriesKey = this.dataElementToSeriesKey[dataElement];
      if (!resultsPerPeriod[period]) {
        resultsPerPeriod[period] = { timestamp: periodToTimestamp(period) };
      }
      resultsPerPeriod[period][seriesKey] = value;
    });

    return resultsPerPeriod;
  };
}

export const analyticsPerPeriod = (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const { aggregationType } = dataBuilderConfig;
  const builder = new AnalyticsPerPeriodBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
