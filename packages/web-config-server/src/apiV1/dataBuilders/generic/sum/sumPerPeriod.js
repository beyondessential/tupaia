/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import {
  periodToTimestamp,
  periodToDisplayString,
  parsePeriodType,
  convertToPeriod,
} from '@tupaia/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import flattenDeep from 'lodash.flattendeep';

/**
 * Sample dataBuilderConfig:
 * {
 *    dataClasses: {
 *        population: {
 *            codes: ['MALE_POP', 'FEMALE_POP']
 *        }
 *    },
 *    periodType: 'month'
 * }
}
 */
class SumPerPeriodBuilder extends DataBuilder {
  /**
   * @returns {SumAggregateSeriesOutput}
   */
  async build() {
    const dataElements = this.getAllDataElements();

    const { results, period } = await this.fetchAnalytics(dataElements);

    const dataElementToDataClass = this.getDataElementToDataClass();
    const dataByPeriod = {};
    const configPeriodType = this.config.periodType
      ? parsePeriodType(this.config.periodType)
      : null;

    results.forEach(({ period: dataPeriod, value, dataElement }) => {
      const dataClass = dataElementToDataClass[dataElement];
      const convertPeriod = configPeriodType //Convert period to if configPeriodType is set (eg: period = '20200331', configPeriodType = 'MONTH' => convertPeriod = '202003')
        ? convertToPeriod(dataPeriod, configPeriodType)
        : dataPeriod;

      if (!dataByPeriod[convertPeriod]) {
        dataByPeriod[convertPeriod] = {
          timestamp: periodToTimestamp(convertPeriod),
          name: periodToDisplayString(convertPeriod, configPeriodType),
        };
      }

      dataByPeriod[convertPeriod][dataClass] =
        (dataByPeriod[convertPeriod][dataClass] || 0) + value;
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
  getAllDataElements() {
    return flattenDeep(Object.values(this.config.dataClasses).map(({ codes }) => codes));
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

export const sumAllPreviousPerDay = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.SUM_PREVIOUS_EACH_DAY);

export const sumPerWeek = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.FINAL_EACH_WEEK);

export const sumPerMonth = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.FINAL_EACH_MONTH);

export const sumPerYear = (config, aggregator, dhisApi) =>
  sumPerPeriod(config, aggregator, dhisApi, aggregator.aggregationTypes.FINAL_EACH_YEAR);
