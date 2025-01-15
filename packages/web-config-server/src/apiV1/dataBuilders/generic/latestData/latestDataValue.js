import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class LatestDataValueBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    if (!results || !results.length) {
      return { data: [] };
    }
    const [result] = results;
    return { data: [{ value: result?.value ?? null }] };
  }
}

export const latestDataValue = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new LatestDataValueBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.MOST_RECENT,
  );
  return builder.build();
};
