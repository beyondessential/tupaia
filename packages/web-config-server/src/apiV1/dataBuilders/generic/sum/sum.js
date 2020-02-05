/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { DATA_SOURCE_TYPES } from '/apiV1/dataBuilders/dataSourceTypes';

const { SINGLE, GROUP } = DATA_SOURCE_TYPES;

/**
 * Configuration schema
 * @typedef {Object} SumConfig
 * @property {DataSource} dataSource
 *
 * Example:
 * ```
 * {
 *   dataSource: {
 *     type: 'single',
 *     codes: ['POP01', 'POP02']
 *   }
 * }
 * ```
 */

export class SumBuilder extends DataBuilder {
  getAnalyticsQueryConfig() {
    const { dataSource } = this.config;
    if (!dataSource) {
      throw new Error('A data source must be provided');
    }
    const { type, codes } = dataSource;

    switch (type) {
      case SINGLE: {
        return { dataElementCodes: codes };
      }
      case GROUP:
        return { dataElementGroupCodes: codes };
      default:
        throw new Error(`Data source type must be one of ${[SINGLE, GROUP]}`);
    }
  }

  async fetchResults() {
    const analyticsQueryConfig = this.getAnalyticsQueryConfig();
    const { results } = await this.getAnalytics(analyticsQueryConfig);

    return results;
  }

  buildData = results => {
    const sum = Object.values(results).reduce((result, { value }) => result + value, 0);
    return [{ name: 'sum', value: sum }];
  };

  async build() {
    const results = await this.fetchResults();
    const data = this.buildData(results);

    return { data };
  }
}

export const sumLatest = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new SumBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    AGGREGATION_TYPES.MOST_RECENT,
  );
  return builder.build();
};
