/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { SumBuilder } from '/apiV1/dataBuilders/generic/sum/sum';
import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';

export class SumPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => SumBuilder;

  async fetchResultsAndPeriod() {
    const { dataElementCodes } = this.config;
    const { period, results } = await this.fetchAnalytics(dataElementCodes, {
      organisationUnitCode: this.entity.code,
    });
    return { results, period };
  }
}

export const sumLatestPerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new SumPerOrgUnitBuilder(
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

export const sumAllPerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new SumPerOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.SUM,
  );
  return builder.build();
};
