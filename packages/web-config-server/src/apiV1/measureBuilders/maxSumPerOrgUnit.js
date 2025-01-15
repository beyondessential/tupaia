import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class MaxSumPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => MaxSumBuilder;

  async fetchResultsAndPeriod() {
    const { dataElementCodes } = this.config;
    const { results, period } = await this.fetchAnalytics(dataElementCodes, {
      organisationUnitCode: this.entity.code,
    });
    return { results, period };
  }
}

export class MaxSumBuilder extends DataBuilder {
  buildData = results => {
    const sortedResults = results.sort((a, b) => b.value - a.value);
    const max = sortedResults[0].dataElement;
    return [{ name: 'max', value: max }];
  };
}

export const maxSumPerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new MaxSumPerOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.MOST_RECENT,
  );
  return builder.build();
};
