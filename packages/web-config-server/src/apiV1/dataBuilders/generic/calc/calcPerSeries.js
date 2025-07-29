import { flattenDeep } from 'es-toolkit/compat';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { calculateOperationForAnalytics } from '/apiV1/dataBuilders/helpers';

/**
 * Config Example:
  {
    series: {
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

    if (!results.length) {
      return { data: [] };
    }

    const dataByClass = {};

    for (const [seriesKey, dataClasses] of Object.entries(this.config.series)) {
      for (const [classKey, seriesConfig] of Object.entries(dataClasses)) {
        if (!dataByClass[classKey]) {
          dataByClass[classKey] = { name: classKey };
        }

        dataByClass[classKey][seriesKey] = await calculateOperationForAnalytics(
          this.models,
          results,
          seriesConfig,
        );
      }
    }

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

export const calcPerSeries = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CalcPerSeriesDataBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
