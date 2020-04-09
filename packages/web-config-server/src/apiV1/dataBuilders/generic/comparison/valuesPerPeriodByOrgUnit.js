/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class ValuesPerPeriodByOrgUnitBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes, includeTotal } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    if (results.length === 0) return { data: results };

    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, organisationUnit } = result;

      resultsPerPeriod[period] = { ...resultsPerPeriod[period], [organisationUnit]: value };
    });

    if (includeTotal) {
      Object.entries(resultsPerPeriod).forEach(([key, data]) => {
        const total = Object.values(data).reduce((count, dataValue) => count + dataValue, 0);
        resultsPerPeriod[key].total = total;
      });
    }

    const data = Object.entries(resultsPerPeriod).reduce(
      (previousData, [period, periodData]) => [
        ...previousData,
        {
          name: periodToDisplayString(period),
          timestamp: periodToTimestamp(period),
          ...periodData,
        },
      ],
      [],
    );

    return { data };
  }
}

function valuesPerPeriodByOrgUnit(queryConfig, aggregator, dhisApi, aggregationType) {
  const { dataBuilderConfig, query, entity } = queryConfig;
  const builder = new ValuesPerPeriodByOrgUnitBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const sumPreviousValuesPerDayByOrgUnit = async (queryConfig, aggregator, dhisApi) =>
  valuesPerPeriodByOrgUnit(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.SUM_PREVIOUS_EACH_DAY,
  );
