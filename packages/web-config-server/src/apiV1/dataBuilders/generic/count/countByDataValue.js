import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { getDataElementCodesInGroup } from '/apiV1/utils';

class CountByDataValueBuilder extends DataBuilder {
  async build() {
    const { valuesOfInterest } = this.config;
    const dataElementCodes = await this.getDataElementCodes();
    const { results } = await this.fetchAnalytics(dataElementCodes);

    const returnJson = {};
    const returnDataJson = {};
    results
      .filter(result => dataElementCodes.includes(result.dataElement))
      .forEach(({ value }) => {
        if (valuesOfInterest && !valuesOfInterest.includes(value)) {
          // not interested in this value, ignore it
          return;
        }
        if (!returnDataJson[value]) {
          returnDataJson[value] = { value: 0, name: value };
        }
        returnDataJson[value].value += 1;
      });

    returnJson.data = Object.values(returnDataJson);
    return returnJson;
  }

  async getDataElementCodes() {
    const { dataElementGroupCode, dataElementCodes } = this.config;
    return dataElementGroupCode
      ? getDataElementCodesInGroup(this.dhisApi, dataElementGroupCode)
      : dataElementCodes;
  }
}

function countByDataValue(
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
  aggregationType,
) {
  const builder = new CountByDataValueBuilder(
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

export const countByLatestDataValues = async (queryConfig, aggregator, dhisApi) =>
  countByDataValue(queryConfig, aggregator, dhisApi);

export const countByAllDataValues = async (queryConfig, aggregator, dhisApi) =>
  countByDataValue(queryConfig, aggregator, dhisApi, aggregator.aggregationTypes.RAW);
