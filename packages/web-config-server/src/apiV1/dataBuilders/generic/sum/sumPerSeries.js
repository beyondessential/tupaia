/**
 * Tupaia Config Server
 * * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { DATA_SOURCE_TYPES } from '/apiV1/dataBuilders/dataSourceTypes';
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
 *         Diabetes: { dataSource: { codes: ['DM_Males_25_plus'], type: 'group' } },
 *         Hypertension: { dataSource: { codes: ['HTN_Males_25_plus'], type: 'group' } },
 *       },
 *     },
 *     Females: {
 *       dataClasses: {
 *         Diabetes: { dataSource: { codes: ['DM_Females_25_plus'], type: 'group' } },
 *         Hypertension: { dataSource: { codes: ['HTN_Females_25_plus'], type: 'group' } },
 *       },
 *     },
 *   },
 * }
 * ```
 */

const { SUM_MOST_RECENT_PER_FACILITY } = AGGREGATION_TYPES;
const { GROUP } = DATA_SOURCE_TYPES;

class SumPerSeriesDataBuilder extends DataBuilder {
  /**
   * @returns {NamedValuesOutput}
   */
  async build() {
    const dataByClass = {};

    await Promise.all(
      Object.entries(this.config.series).map(async ([seriesKey, { dataClasses }]) => {
        const classData = await this.getDataForClasses(dataClasses);
        Object.entries(classData).forEach(([classKey, sum]) => {
          const dataItem = dataByClass[classKey] || { name: classKey };
          dataByClass[classKey] = { ...dataItem, [seriesKey]: sum };
        });
      }),
    );
    const data = this.sortDataByName(Object.values(dataByClass));

    return { data };
  }

  async getDataForClasses(classes) {
    const data = {};
    await Promise.all(
      Object.entries(classes).map(async ([key, { dataSource }]) => {
        data[key] = await this.fetchSumOfDataSource(dataSource);
      }),
    );

    return data;
  }

  fetchSumOfDataSource({ codes, type }) {
    if (type !== GROUP) {
      throw new Error(`Data source type ${type} not supported`);
    }

    return this.fetchSumOfDataElementGroup(codes);
  }

  async fetchSumOfDataElementGroup(dataElementGroupCodes) {
    const { results } = await this.getDataValueAnalytics({ dataElementGroupCodes });

    // Sum all 'value' properties
    return Object.values(results).reduce((sum, { value }) => sum + value, 0);
  }
}

export const sumLatestPerSeries = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new SumPerSeriesDataBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    SUM_MOST_RECENT_PER_FACILITY,
  );

  return builder.build();
};
