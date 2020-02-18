/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { SumBuilder } from '/apiV1/dataBuilders/generic/sum/sum';
import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';

export class SumPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => SumBuilder;

  async fetchResults() {
    const { dataElementCodes } = this.config;
    const { organisationUnitGroupCode } = this.query;

    const { results } = await this.fetchAnalytics(dataElementCodes, {
      organisationUnitCode: organisationUnitGroupCode,
    });
    return results;
  }
}

export const sumLatestPerOrgUnit = async (aggregator, dhisApi, query, measureBuilderConfig) => {
  const builder = new SumPerOrgUnitBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    null,
    aggregator.aggregationTypes.MOST_RECENT,
  );
  return builder.build();
};
