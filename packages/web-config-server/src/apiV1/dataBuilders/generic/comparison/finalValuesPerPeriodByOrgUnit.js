/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class FinalValuesPerPeriodByOrgUnitBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes, includeTotal, labels = {} } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    if (results.length === 0) return { data: results };

    const resultsPerPeriod = {};
    results.forEach(result => {
      const { period, value, organisationUnit } = result;

      const dataKey = labels[organisationUnit] || organisationUnit;
      resultsPerPeriod[period] = { ...resultsPerPeriod[period], [dataKey]: value };
    });

    if (includeTotal) {
      Object.entries(resultsPerPeriod).forEach(([key, data]) => {
        const total = Object.values(data).reduce((count, dataValue) => count + dataValue, 0);
        const dataKey = labels.total || 'total';
        resultsPerPeriod[key][dataKey] = total;
      });
    }

    const data = Object.entries(resultsPerPeriod).reduce(
      (previousData, [period, periodData]) => [
        ...previousData,
        {
          ...periodData,
          name: periodToDisplayString(period),
          timestamp: periodToTimestamp(period),
        },
      ],
      [],
    );

    return { data };
  }
}

function finalValuesPerPeriodByOrgUnit(queryConfig, aggregator, dhisApi, aggregationType) {
  const { dataBuilderConfig, query, entity } = queryConfig;
  const builder = new FinalValuesPerPeriodByOrgUnitBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const finalValuesPerDayByOrgUnit = async (queryConfig, aggregator, dhisApi) =>
  finalValuesPerPeriodByOrgUnit(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.FINAL_EACH_DAY,
  );
