import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { checkValueSatisfiesCondition } from '/apiV1/dataBuilders/helpers';
import { analyticsToMeasureData } from 'apiV1/measureBuilders/helpers';

class CheckConditionsBuilder extends DataBuilder {
  async build() {
    const { dataElementCode } = this.query;
    const { condition } = this.config;

    const { results } = await this.fetchAnalytics([dataElementCode]);
    const analytics = results.map(result => ({
      ...result,
      value: checkValueSatisfiesCondition(result.value, condition) ? 1 : 0,
    }));
    return analyticsToMeasureData(analytics);
  }
}

export const checkConditions = async (aggregator, dhisApi, query, measureBuilderConfig = {}) => {
  const builder = new CheckConditionsBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    undefined,
    measureBuilderConfig.aggregationType,
  );

  return builder.build();
};
