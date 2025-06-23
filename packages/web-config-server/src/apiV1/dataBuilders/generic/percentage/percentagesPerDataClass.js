import {
  aggregateOperationalFacilityValues,
  getFacilityStatuses,
  limitRange,
  mapDataSourcesToElementCodes,
} from '/apiV1/utils';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} PercentagesPerDataClassConfig
 * @property {Object<string, { numerator, denominator }>} dataClasses
 * @property {number[]} [range]
 *
 * Example:
 * ```js
 * {
 *   range: [0, 1],
 *   dataClasses: {
 *     'Hep B Birth Dose': {
 *       numerator: { dataSource: { codes: ['IMMS42'], type: 'single' } },
 *       denominator: { dataSource: { codes: ['All_Doses'], type: 'group' } },
 *     },
 *     'OPV Dose': {
 *       numerator: { dataSource: { codes: ['OPV_Dose'], type: 'group' } },
 *       denominator: { dataSource: { codes: ['IMMS42', 'IMMS43'], type: 'single' } },
 *     },
 *   },
 * }
 */

class PercentagesPerDataClassDataBuilder extends DataBuilder {
  async build() {
    const dataElementMap = await this.getDataElementMap();
    const dataElementCodes = Object.values(dataElementMap).reduce((result, currentCodes) => {
      return result.concat(currentCodes);
    }, []);

    const { results } = await this.fetchAnalytics(dataElementCodes);
    const sumPerDataElementCode = await this.getSumPerDataElementCode(results);

    const { dataClasses } = this.config;

    const data = Object.keys(dataClasses).map(dataClassKey => {
      const { value, numerator, denominator } = this.calculateDataClassValue(
        dataClassKey,
        sumPerDataElementCode,
        dataElementMap,
      );

      return {
        name: dataClassKey,
        value,
        [`${dataClassKey}_metadata`]: {
          numerator,
          denominator,
        },
      };
    });
    this.sortDataByName(data);

    return { data: this.areDataAvailable(data) ? data : [] };
  }

  async getDataElementMap() {
    const dataSources = {};
    Object.entries(this.config.dataClasses).forEach(([key, { numerator, denominator }]) => {
      dataSources[`${key} numerator`] = numerator.dataSource;
      dataSources[`${key} denominator`] = denominator.dataSource;
    });

    return mapDataSourcesToElementCodes(this.dhisApi, dataSources);
  }

  async getSumPerDataElementCode(results) {
    // Set up data structure to be aggregated (potentially across multiple facilities)
    const sumPerCode = {};

    const incrementTotals = ({ dataElement: dataElementCode, value }) => {
      const currentSum = sumPerCode[dataElementCode] || 0;
      sumPerCode[dataElementCode] = currentSum + value;
    };

    if (this.entity.isFacility() || this.config.disableFilterOperationalFacilityValues) {
      // Single facility, don't worry if it is operational or not
      results.forEach(incrementTotals);
    } else {
      // Aggregate the numerator and denominator per month, across all operational facilities
      const { organisationUnitCode, period } = this.query;
      const operationalFacilities = await getFacilityStatuses(
        this.aggregator,
        organisationUnitCode,
        period,
      );
      aggregateOperationalFacilityValues(operationalFacilities, results, incrementTotals);
    }

    return sumPerCode;
  }

  calculateDataClassValue(dataClassKey, sumPerDataElementCode, dataElementMap) {
    const { range } = this.config;

    const getValueForDataSource = sourceKey =>
      dataElementMap[sourceKey].reduce(
        (sum, dataElementCode) => sum + (sumPerDataElementCode[dataElementCode] || 0),
        0,
      );

    const numeratorValue = getValueForDataSource(`${dataClassKey} numerator`);
    const denominatorValue = getValueForDataSource(`${dataClassKey} denominator`);
    const value = divideValues(numeratorValue, denominatorValue);

    const finalValue = range ? limitRange(value, range) : value;

    return {
      numerator: numeratorValue,
      denominator: denominatorValue,
      value: finalValue,
    };
  }
}

const basicPercentagesPerDataClass = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) => {
  const builder = new PercentagesPerDataClassDataBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );

  return builder.build();
};

export const percentagesPerDataClass = (config, aggregator, dhisApi) =>
  basicPercentagesPerDataClass(config, aggregator, dhisApi);

export const percentagesPerDataClassByMonth = (config, aggregator, dhisApi) =>
  basicPercentagesPerDataClass(
    config,
    aggregator,
    dhisApi,
    aggregator.aggregationTypes.FINAL_EACH_MONTH,
  );
