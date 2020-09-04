/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp } from '@tupaia/utils';
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
    const dataElementToSeriesKey = {};
    this.getSeries().forEach(({ key, dataElementCodes }) => {
      dataElementCodes.forEach(dataElementCode => {
        dataElementToSeriesKey[dataElementCode] = key;
      });
    });
    return dataElementToSeriesKey;
  }

  getSeries() {
    return this.config.series || [{ key: 'value', dataElementCodes: this.config.dataElementCodes }];
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

export const analyticsPerPeriod = ({ dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const { aggregationType } = dataBuilderConfig;
  const builder = new AnalyticsPerPeriodBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
