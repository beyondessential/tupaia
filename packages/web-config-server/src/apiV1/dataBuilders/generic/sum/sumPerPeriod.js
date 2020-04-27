/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import flattenDeep from 'lodash.flattendeep';

class SumPerPeriodBuilder extends DataBuilder {
  /**
   * @returns {SumAggregateSeriesOutput}
   */
  async build() {
    const { results, period } = await this.fetchResults();
    const dataElementToDataClass = this.getDataElementToDataClass();
    const dataByPeriod = {};

    results.forEach(({ period: dataPeriod, value, dataElement }) => {
      const dataClass = dataElementToDataClass[dataElement];

      if (!dataByPeriod[dataPeriod]) {
        dataByPeriod[dataPeriod] = { timestamp: periodToTimestamp(dataPeriod) };
        dataByPeriod[dataPeriod].name = periodToDisplayString(dataPeriod);
      }

      dataByPeriod[dataPeriod][dataClass] = (dataByPeriod[dataPeriod][dataClass] || 0) + value;
    });

    return { data: Object.values(dataByPeriod), period };
  }

  /**
   * Get a map of the data element to its associated data class
   */
  getDataElementToDataClass() {
    const dataElementToDataClass = {};

    Object.entries(this.config.dataClasses).forEach(([key, value]) => {
      value.codes.forEach(code => {
        dataElementToDataClass[code] = key;
      });
    });

    return dataElementToDataClass;
  }

  /**
   * Flatten all the data elements and use them to fetch analytics.
   */
  async fetchResults() {
    const dataElements = flattenDeep(
      Object.values(this.config.dataClasses).map(dataCodes => Object.values(dataCodes)),
    );

    return this.fetchAnalytics(dataElements);
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
