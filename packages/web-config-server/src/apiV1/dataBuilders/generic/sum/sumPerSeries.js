/**
 * Tupaia Config Server
 * * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flattenDeep from 'lodash.flattendeep';
import sumBy from 'lodash.sumby';
import keyBy from 'lodash.keyby';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * Configuration schema
 * @typedef {Object} SumPerSeriesConfig
 * @property {Object<string, { dataClasses: Object<string, DataSourceDescriptor> }} series
 *
 * Example:
 * ```js
 * {
 *   series: {
 *     Males: {
 *       dataClasses: {
 *         Diabetes: ['CH60', 'CH61'],
 *         Hypertension: ['CH62', 'CH63'],
 *       },
 *     },
 *     Females: {
 *       dataClasses: {
 *         Diabetes: ['CH64', 'CH65'],
 *         Hypertension: ['CH66', 'CH67'],
 *       },
 *     },
 *   },
 * }
 * ```
 */

class SumPerSeriesDataBuilder extends DataBuilder {
  /**
   * @returns {NamedValuesOutput}
   */
  async build() {
    const results = await this.fetchResults();
    const sumByDataElement = keyBy(results, 'dataElement');

    const dataByClass = {};
    Object.entries(this.config.series).forEach(([seriesKey, dataClasses]) => {
      Object.entries(dataClasses).forEach(([classKey, dataElements]) => {
        if (!dataByClass[classKey]) {
          dataByClass[classKey] = { name: classKey };
        }

        const sum = sumBy(dataElements, dataElement => sumByDataElement[dataElement]) || 0;
        dataByClass[classKey][seriesKey] = sum;
      });
    });

    const data = this.sortDataByName(Object.values(dataByClass));
    return { data };
  }

  async fetchResults() {
    const dataElements = flattenDeep(
      Object.values(this.config.series).map(dataClasses => Object.values(dataClasses)),
    );
    const { results } = await this.fetchAnalytics(dataElements);

    return results;
  }
}

export const sumLatestPerSeries = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SumPerSeriesDataBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.SUM_MOST_RECENT_PER_FACILITY,
  );

  return builder.build();
};
