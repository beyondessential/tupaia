/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { periodToTimestamp, periodToDisplayString, reduceToDictionary } from '@tupaia/utils';
import { getDefaultPeriod } from '/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import groupBy from 'lodash.groupby';

/**
 * This is purposely kept separate from ValuesPerPeriodByOrgUnitBuilder
 * Rather than overloading ValuesPerPeriodByOrgUnitBuilder, keeping
 * this functionality that isn't likely be needed for something else
 * in the near future separated until it can be better solved by
 * an indicator.
 */
class ValuesPer100kPerPeriodByOrgUnitBuilder extends DataBuilder {
  async build() {
    const { dataElementCodes, divisor: populationDataElement } = this.config;
    const { results } = await this.fetchAnalytics(dataElementCodes);

    // TODO: You should be able to specify period in additionalQueryConfig
    // for fetchAnalytics to avoid this hack.
    const originalQueryPeriod = this.query.period;
    this.query.period = getDefaultPeriod();

    const { results: populationResults } = await this.fetchAnalytics(
      [populationDataElement],
      {},
      this.aggregator.aggregationTypes.FINAL_EACH_DAY_FILL_EMPTY_DAYS,
    );

    this.query.period = originalQueryPeriod;

    if (results.length === 0) return { data: results };

    const populationResultsGroupedByPeriod = this.groupPopulationResultsByPeriod(populationResults);

    const resultsPerPeriod = {};

    results.forEach(result => {
      const { period, value, organisationUnit } = result;

      //Assume that we always have population result available for a period.
      const populationResultByOrg = populationResultsGroupedByPeriod[period];

      const valuePer100k = Math.round((value / populationResultByOrg[organisationUnit]) * 100000);

      resultsPerPeriod[period] = {
        ...resultsPerPeriod[period],
        [organisationUnit]: valuePer100k,
      };
    });

    const data = [];

    Object.entries(resultsPerPeriod).forEach(([period, periodData]) => {
      data.push({
        ...periodData,
        name: periodToDisplayString(period),
        timestamp: periodToTimestamp(period),
      });
    });

    return { data };
  }

  /**
   * Group the Population Results array[] to a dictionary keyed by period. Eg:
   * {
   *  20200406: {
   *      'AU_New South Wales': 8118000,
   *      'AU_Victoria': 6629900,
   *      'AU_Queensland': 5115500,
   *      'AU_Western Australia': 2630600,
   *      'AU_South Australia': 1756500,
   *      'AU_Australian Capital Territory': 428100,
   *      'AU_Tasmania': 535500,
   *      'AU_Northern Territory': 245600
   *  },
   * ...
   * }
   * @param {Array} populationResults Array of all the population results
   */
  groupPopulationResultsByPeriod = populationResults => {
    //Group the population results array by 'period'
    const populationResultsGroupedByPeriod = groupBy(populationResults, 'period');

    //Convert each grouped period into a dictionary keyed by 'organisationUnit'
    Object.entries(populationResultsGroupedByPeriod).forEach(([period, populationResultValue]) => {
      populationResultsGroupedByPeriod[period] = reduceToDictionary(
        populationResultValue,
        'organisationUnit',
        'value',
      );
    });

    return populationResultsGroupedByPeriod;
  };
}

function sumPreviousValuesPer100kByOrgUnit(queryConfig, aggregator, dhisApi, aggregationType) {
  const { models, dataBuilderConfig, query, entity } = queryConfig;
  const builder = new ValuesPer100kPerPeriodByOrgUnitBuilder(
    models,
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
