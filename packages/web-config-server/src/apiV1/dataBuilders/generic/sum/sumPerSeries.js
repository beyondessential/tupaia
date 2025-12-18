import { flattenDeep, sumBy } from 'es-toolkit/compat';

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * Configuration schema
 * @typedef {Object} SumPerSeriesConfig
 * @property {Object<string, { dataClasses: Object<string, string[]> }} series
 *
 * Example:
 * ```js
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
 * ```
 */

class SumPerSeriesDataBuilder extends DataBuilder {
  /**
   * @returns {NamedValuesOutput}
   */
  async build() {
    const { results, period } = await this.fetchResults();
    const sumByDataElement = this.calculateSumByDataElement(results);

    const dataByClass = {};
    Object.entries(this.config.series).forEach(([seriesKey, dataClasses]) => {
      Object.entries(dataClasses).forEach(([classKey, dataElements]) => {
        if (!dataByClass[classKey]) {
          dataByClass[classKey] = { name: classKey };
        }

        const sum = sumBy(dataElements, dataElement => sumByDataElement[dataElement]) || 0;
        dataByClass[classKey][seriesKey] = sum;
      });
    });
    const { dataClassKeyOrder = [] } = this.config;
    const data =
      dataClassKeyOrder.length > 0
        ? dataClassKeyOrder.map(dataClassKey => dataByClass[dataClassKey])
        : this.sortDataByName(Object.values(dataByClass));
    return { data, period };
  }

  async fetchResults() {
    const dataElements = flattenDeep(
      Object.values(this.config.series).map(dataClasses => Object.values(dataClasses)),
    );
    const analyticsResults = await this.fetchAnalytics(dataElements);

    return analyticsResults;
  }

  calculateSumByDataElement = results =>
    results.reduce(
      (sum, { dataElement, value }) => ({
        ...sum,
        [dataElement]: (sum[dataElement] || 0) + value,
      }),
      {},
    );
}

export const sumLatestPerSeries = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SumPerSeriesDataBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.SUM_MOST_RECENT_PER_FACILITY,
  );

  return builder.build();
};

export const sumPerMonthPerSeries = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SumPerSeriesDataBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.FINAL_EACH_MONTH,
  );

  return builder.build();
};

export const sumPerYearPerSeries = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SumPerSeriesDataBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregator.aggregationTypes.FINAL_EACH_YEAR,
  );

  return builder.build();
};
