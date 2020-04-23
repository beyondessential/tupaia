/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { reduceToDictionary } from '@tupaia/utils';
import { getDefaultPeriod } from '/dhis/getDefaultPeriod';
import { periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * This is purposely kept separate from ValuesPerPeriodByOrgUnitBuilder
 * Rather than overloading ValuesPerPeriodByOrgUnitBuilder, keeping
 * this functionality that isn't likely be needed for something else
 * in the near future separated until it can be better solved by
 * an indicator.
 */
class ValuesPer100kPerPeriodByOrgUnitBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes, divisor } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);
    const { results: calcResults } = await this.aggregator.fetchAnalytics(
      [divisor],
      { dataServices: this.config.dataServices },
      { ...this.query, period: getDefaultPeriod() },
      { aggregationType: this.aggregator.aggregationTypes.MOST_RECENT },
    );
    if (results.length === 0) return { data: results };

    const resultsPerPeriod = {};
    const calcResultsByOrg = reduceToDictionary(calcResults, 'organisationUnit', 'value');

    results.forEach(result => {
      const { period, value, organisationUnit } = result;
      const valuePer100k = Math.round((value / calcResultsByOrg[organisationUnit]) * 100000);
      resultsPerPeriod[period] = {
        ...resultsPerPeriod[period],
        [organisationUnit]: valuePer100k,
      };
    });

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

function sumPreviousValuesPer100kByOrgUnit(queryConfig, aggregator, dhisApi, aggregationType) {
  const { dataBuilderConfig, query, entity } = queryConfig;
  const builder = new ValuesPer100kPerPeriodByOrgUnitBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const sumPreviousValuesPer100kPerDayByOrgUnit = async (queryConfig, aggregator, dhisApi) =>
  sumPreviousValuesPer100kByOrgUnit(
    queryConfig,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.SUM_PREVIOUS_EACH_DAY,
  );
