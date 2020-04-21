/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class SumPerPeriodBuilder extends DataBuilder {
  /**
   * @returns {SumAggregateSeriesOutput}
   */
  async build() {
    const { dataSource } = this.config;
    const { results, period } = await this.fetchAnalytics(dataSource.codes);
    const dataByPeriod = {};
    results.forEach(({ period, value }) => {
      dataByPeriod[period] = (dataByPeriod[period] || 0) + value;
    });

    // Structure the response data
    return {
      data: Object.keys(dataByPeriod)
        .sort()
        .map(period => ({
          name: periodToDisplayString(period),
          timestamp: periodToTimestamp(period),
          value: dataByPeriod[period],
        })),
      period,
    };
  }
}

const sumPerPeriod = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) => {
  const builder = new SumPerPeriodBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};

export const sumPerDay = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.FINAL_EACH_DAY);

export const sumPerWeek = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.FINAL_EACH_WEEK);

export const sumPerMonth = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.FINAL_EACH_MONTH);
