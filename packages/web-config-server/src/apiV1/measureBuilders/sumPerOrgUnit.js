/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { SumBuilder } from '/apiV1/dataBuilders/generic/sum/sum';
import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { AGGREGATION_TYPES } from '/dhis';

export class SumPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => SumBuilder;

  async fetchResults() {
    const { organisationUnitGroupCode } = this.query;

    const analyticsQueryConfig = this.getBaseBuilder().getAnalyticsQueryConfig();
    const { results } = await this.getAnalytics({
      ...analyticsQueryConfig,
      outputIdScheme: 'code',
      organisationUnitCode: organisationUnitGroupCode,
    });

    return results;
  }
}

export const sumLatestPerOrgUnit = async (dhisApi, query, measureBuilderConfig) => {
  const builder = new SumPerOrgUnitBuilder(
    dhisApi,
    measureBuilderConfig,
    query,
    null,
    AGGREGATION_TYPES.MOST_RECENT,
  );
  return builder.build();
};
