import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { checkValueSatisfiesCondition } from '@tupaia/utils';
import { analyticsToMeasureData } from 'apiV1/measureBuilders/helpers';

class CheckConditionsBuilder extends DataBuilder {
  async build() {
    const { dataElementCode: queryDataCode } = this.query;
    const { condition, dataElementCodes: configDataCodes } = this.config;

    const dataElementCodes = configDataCodes || [queryDataCode];
    const { period, results } = await this.fetchAnalytics(dataElementCodes);

    const analytics = results.map(result => ({
      ...result,
      value: checkValueSatisfiesCondition(result.value, condition) ? 1 : 0,
    }));
    return {
      data:
        queryDataCode === 'value'
          ? analyticsToMeasureData(analytics, 'value')
          : analyticsToMeasureData(analytics),
      period,
    };
  }
}

export const checkConditions = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
) => {
  const builder = new CheckConditionsBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    undefined,
    measureBuilderConfig.aggregationType,
  );

  return builder.build();
};
