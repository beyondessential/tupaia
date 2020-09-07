/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp } from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class FinalValuesPerPeriodBuilder extends DataBuilder {
  async build() {
    const dataElementToSeriesKey = this.getDataElementToSeriesKey();
    const dataElementCodes = Object.keys(dataElementToSeriesKey);
    const { results } = await this.fetchAnalytics(dataElementCodes);
    if (results.length === 0) return { data: results };

    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, dataElement } = result;
      const seriesKey = dataElementToSeriesKey[dataElement];
      if (!resultsPerPeriod[period]) {
        resultsPerPeriod[period] = { timestamp: periodToTimestamp(period) };
      }
      resultsPerPeriod[period][seriesKey] = value;
    });
    return { data: Object.values(resultsPerPeriod) };
  }

  getDataElementToSeriesKey() {
    return this.config.series.reduce((result, { key, dataElementCodes }) => {
      dataElementCodes.forEach(dataElementCode => {
        result[dataElementCode] = key;
      });
      return result;
    }, {});
  }
}

function finalValuesPerPeriod(queryConfig, aggregator, dhisApi, aggregationType) {
  const { models, dataBuilderConfig, query, entity } = queryConfig;
  const builder = new FinalValuesPerPeriodBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const finalValuesPerDay = async (queryConfig, aggregator, dhisApi) =>
  finalValuesPerPeriod(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.FINAL_EACH_DAY,
  );

export const finalValuesPerMonth = async (queryConfig, aggregator, dhisApi) =>
  finalValuesPerPeriod(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.FINAL_EACH_MONTH,
  );

export const finalValuesPerYear = async (queryConfig, aggregator, dhisApi) =>
  finalValuesPerPeriod(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.FINAL_EACH_YEAR,
  );
