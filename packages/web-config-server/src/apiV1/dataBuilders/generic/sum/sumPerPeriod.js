/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { AGGREGATION_TYPES, periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class SumPerPeriodBuilder extends DataBuilder {
  /**
   * @returns {SumAggregateSeriesOutput}
   */
  async build() {
    const { dataSource } = this.config;
    const { results } = await this.getAnalytics({
      dataElementCodes: dataSource.codes,
    });
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
    };
  }
}

const sumPerPeriod = async ({ dataBuilderConfig, query, entity }, dhisApi, aggregationType) => {
  const builder = new SumPerPeriodBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};

export const sumPerWeek = (config, dhisApi) =>
  sumPerPeriod(config, dhisApi, AGGREGATION_TYPES.FINAL_EACH_WEEK);

export const sumPerMonth = (config, dhisApi) =>
  sumPerPeriod(config, dhisApi, AGGREGATION_TYPES.FINAL_EACH_MONTH);
