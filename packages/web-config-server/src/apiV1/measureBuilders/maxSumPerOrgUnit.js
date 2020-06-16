/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class MaxSumPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => MaxSumBuilder;

  async fetchResults() {
    const { dataElementCodes } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes, {
      organisationUnitCode: this.entity.code,
    });
    return results;
  }
}

export class MaxSumBuilder extends DataBuilder {
  buildData = results => {
    const sortedResults = results.sort((a, b) => b.value - a.value);
    const max = sortedResults[0].dataElement;
    return [{ name: 'sum', value: max }];
  };
}

export const maxSumPerOrgUnit = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new MaxSumPerOrgUnitBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.MOST_RECENT,
  );
  return builder.build();
};
