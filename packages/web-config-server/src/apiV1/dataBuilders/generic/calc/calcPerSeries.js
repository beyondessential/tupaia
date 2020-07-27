/**
 * Tupaia Config Server
 * * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flattenDeep from 'lodash.flattendeep';

import { calculateAnalyticArithmeticOperation } from '/apiV1/dataBuilders/helpers';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * Config Example:
 * {
 *   series: {
 *     Males: {
 *       dataClasses: {
 *         Diabetes: ['CH60', 'CH61'],
 *         Hypertension: ['CH62', 'CH63'],
 *       },
 *     },
 *     Females: {
 *       dataClasses: {
 *         Diabetes: ['CH64', 'CH65'],
 *         Hypertension: ['CH66', 'CH67'],
 *       },
 *     },
 *   },
 * }
 */

class CalcPerSeriesDataBuilder extends DataBuilder {
  /**
   * @returns {NamedValuesOutput}
   */
  async build() {
    const { results, period } = await this.fetchResults();

    const dataByClass = {};
    Object.entries(this.config.dataClasses).forEach(([classKey, series]) => {
      Object.entries(series).forEach(([seriesKey, seriesConfig]) => {
        if (!dataByClass[seriesKey]) {
          dataByClass[seriesKey] = { name: seriesKey };
        }

        dataByClass[seriesKey][classKey] = calculateAnalyticArithmeticOperation(
          results,
          seriesConfig,
        );
      });
    });

    const data = this.sortDataByName(Object.values(dataByClass));
    return { data, period };
  }

  async fetchResults() {
    const dataElements = flattenDeep(
      Object.values(this.config.dataClasses).map(dataClasses =>
        Object.values(dataClasses).map(({ firstOperand, secondOperand }) =>
          firstOperand.dataValues.concat(secondOperand.dataValues),
        ),
      ),
    );

    const analyticsResults = await this.fetchAnalytics(dataElements);

    return analyticsResults;
  }

  calculateOperationPart = (results, dataValues) => {
    let sum = 0;

    results.forEach(({ dataElement, value }) => {
      if (dataValues.includes(dataElement)) {
        sum += value || 0;
      }
    });

    return sum;
  };
}

export const calcPerSeries = async ({ dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new CalcPerSeriesDataBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
