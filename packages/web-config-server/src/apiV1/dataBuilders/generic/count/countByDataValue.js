import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues } from '/apiV1/dataBuilders/helpers';
import { getDataElementCodesInGroup } from '/apiV1/utils';

class CountByDataValueBuilder extends DataBuilder {
  async build() {
    const { valuesOfInterest, convertToPercentage } = this.config;
    const dataElementCodes = await this.getDataElementCodes();
    const { results } = await this.fetchAnalytics(dataElementCodes);

    const dataByValue = {};
    // Sum recorded for calculating percentage
    let sum = 0;
    results
      .filter(result => dataElementCodes.includes(result.dataElement))
      .forEach(({ value }) => {
        if (valuesOfInterest && !valuesOfInterest.includes(value)) {
          // not interested in this value, ignore it
          return;
        }
        if (!dataByValue[value]) {
          dataByValue[value] = { value: 0, name: value };
        }
        dataByValue[value].value += 1;
        sum += 1;
      });

    if (convertToPercentage) {
      Object.entries(dataByValue).forEach(([key, { value }]) => {
        dataByValue[key].value = divideValues(value, sum);
      });
    }
    return { data: Object.values(dataByValue) };
  }

  async getDataElementCodes() {
    const { dataElementGroupCode, dataElementCodes } = this.config;
    return dataElementGroupCode
      ? getDataElementCodesInGroup(this.dhisApi, dataElementGroupCode)
      : dataElementCodes;
  }
}

function countByDataValue(
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) {
  const builder = new CountByDataValueBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const countByLatestDataValues = async (queryConfig, aggregator, dhisApi) =>
  countByDataValue(queryConfig, aggregator, dhisApi);

export const countByAllDataValues = async (queryConfig, aggregator, dhisApi) =>
  countByDataValue(queryConfig, aggregator, dhisApi, aggregator.aggregationTypes.RAW);
