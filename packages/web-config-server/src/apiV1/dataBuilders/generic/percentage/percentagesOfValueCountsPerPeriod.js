/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { groupAnalyticsByPeriod } from '@tupaia/dhis-api';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { PercentagesOfValueCountsBuilder } from '/apiV1/dataBuilders/generic/percentage/percentagesOfValueCounts';

class PercentagesOfValueCountsPerPeriodBuilder extends DataPerPeriodBuilder {
  getBaseBuilderClass = () => PercentagesOfValueCountsBuilder;

  groupResultsByPeriod(results) {
    return groupAnalyticsByPeriod(results, this.config.periodType);
  }

  async fetchResults() {
    return this.getBaseBuilder().fetchResults();
  }

  formatData(data) {
    return this.areDataAvailable(data) ? data : [];
  }
}

export const percentagesOfValueCountsPerPeriod = async (
  { dataBuilderConfig, query, organisationUnitInfo },
  dhisApi,
) => {
  const builder = new PercentagesOfValueCountsPerPeriodBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    organisationUnitInfo,
  );

  return builder.build();
};
