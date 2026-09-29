import { DataBuilder } from '../../DataBuilder';

class AnalyticsBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    return { data: results };
  }
}

export const analytics = ({ models, dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const { aggregationType } = dataBuilderConfig;
  const builder = new AnalyticsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
};
