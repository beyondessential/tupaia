import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * Configuration schema
 * @typedef {Object} SumConfig
 * @property {string[]} dataElementCodes
 *
 * Example:
 * ```
 * {
 *   dataElementCodes: ['POP01', 'POP02']
 * }
 * ```
 */

export class SumBuilder extends DataBuilder {
  async fetchResults() {
    const { dataElementCodes } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);

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

export const sum = async ({ models, dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new SumBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    dataBuilderConfig.aggregationType,
  );
  return builder.build();
};
