/**
 * Tupaia Config Server
 * * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import flattenDeep from 'lodash.flattendeep';

import { calculateArithmeticOperationForAnalytics } from '/apiV1/dataBuilders/helpers';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * Config Example:
  {
    dataClasses: {
      'Lao Language': {
        'Grade 1': {
          operator: 'SUBTRACT',
          operands: [
            {
              dataValues: ['SchPop011', 'SchPop012'],
            },
            {
              dataValues: ['STCL001'],
            },
          ],
        },
        'Grade 2': {
          operator: 'SUBTRACT',
          operands: [
            {
              dataValues: ['SchPop013', 'SchPop014'],
            },
            {
              dataValues: ['STCL020'],
            },
          ],
        },
      }
    }
  }
 */

class CalcPerSeriesDataBuilder extends DataBuilder {
  async build() {
    const { results, period } = await this.fetchResults();
    const dataByClass = {};

    Object.entries(this.config.series).forEach(([seriesKey, dataClasses]) => {
      Object.entries(dataClasses).forEach(([classKey, seriesConfig]) => {
        if (!dataByClass[classKey]) {
          dataByClass[classKey] = { name: classKey };
        }

        dataByClass[classKey][seriesKey] = calculateArithmeticOperationForAnalytics(
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
      Object.values(this.config.series).map(series =>
        Object.values(series).map(({ operands }) => operands.map(operand => operand.dataValues)),
      ),
    );

    return this.fetchAnalytics(dataElements);
  }
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
