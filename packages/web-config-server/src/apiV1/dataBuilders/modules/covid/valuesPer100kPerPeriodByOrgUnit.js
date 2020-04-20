/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */
import { reduceToDictionary } from '@tupaia/utils';
import { periodToTimestamp, periodToDisplayString } from '@tupaia/dhis-api';
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
    const { results: populationResults } = await this.fetchAnalytics(
      [populationDataElement],
      {},
      this.aggregator.aggregationTypes.RAW,
    );

    if (results.length === 0) return { data: results };

    const populationResultsGroupedByPeriod = this.convertPopulationResultsToDictionary(
      populationResults,
    );

    //Get an array of all the population result periods and sort them desc
    const sortedPopulationPeriodsDesc = Object.keys(populationResultsGroupedByPeriod).sort(
      (period1, period2) => period2 - period1,
    );

    const resultsPerPeriod = {};

    //Store a map {period -> populationPeriod} so that if we already process one and cached, we don't have to do it again.
    const cachedClosestPopulationPeriod = {};

    results.forEach(result => {
      const { period, value, organisationUnit } = result;

      //See if the closest population period is already found
      let closestPopulationPeriod = cachedClosestPopulationPeriod[period];

      if (!closestPopulationPeriod) {
        closestPopulationPeriod = this.getClosestPopulationResultPeriod(
          populationResultsGroupedByPeriod,
          sortedPopulationPeriodsDesc,
          period,
        );

        cachedClosestPopulationPeriod[period] = closestPopulationPeriod;
      }

      const calcResultsByOrg = populationResultsGroupedByPeriod[closestPopulationPeriod];

      const valuePer100k = Math.round((value / calcResultsByOrg[organisationUnit]) * 100000);

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
  convertPopulationResultsToDictionary = populationResults => {
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

  /**
   * Get the closest period of population results that match with the period of the data.
   * We assume that sortedPopulationPeriodsDesc array has at least 1 period. Otherwise, we have a bigger problem.
   * @param {Object} populationResultsGroupedByPeriod Population results grouped by period.
   * @param {Object} sortedPopulationPeriodsDesc Array of all the population periods, sort in descending order.
   * @param {string} dataPeriod The period of the current processing result.
   */
  getClosestPopulationResultPeriod = (
    populationResultsGroupedByPeriod,
    sortedPopulationPeriodsDesc,
    dataPeriod,
  ) => {
    //If we have the exact period of the population result, great!
    if (populationResultsGroupedByPeriod[dataPeriod]) {
      return dataPeriod;
    }

    if (sortedPopulationPeriodsDesc && sortedPopulationPeriodsDesc.length === 1) {
      return sortedPopulationPeriodsDesc[0];
    }

    //eg: sortedPopulationPeriodsDesc = [20200406, 20200401, 20200326]; dataPeriod = 20200328. 20200326 will be picked.
    const closestPopulationPeriod = sortedPopulationPeriodsDesc.find(period => period < dataPeriod);

    //If we cannot pick the closestPopulationPeriod, it means that all the population periods are after the data period,
    //choose the closest one which is the last period of the array.
    //eg: sortedPopulationPeriodsDesc = [20200406, 20200401, 20200326]; dataPeriod = 20200323. 20200326 will be picked.
    return (
      closestPopulationPeriod || sortedPopulationPeriodsDesc[sortedPopulationPeriodsDesc.length - 1]
    );
  };
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
