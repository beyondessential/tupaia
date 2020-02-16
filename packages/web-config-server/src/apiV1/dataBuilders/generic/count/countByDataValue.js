import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { getDataElementsInGroup } from '/apiV1/utils';

class CountByDataValueBuilder extends DataBuilder {
  async build() {
    const { valuesOfInterest } = this.config;
    const results = await this.fetchAnalytics();

    const returnJson = {};
    const returnDataJson = {};
    results.forEach(({ value }) => {
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

  async fetchAnalytics() {
    let { dataElementCodes } = this.config;

    const { dataElementGroupCode } = this.config;
    if (dataElementGroupCode) {
      const dataElements = await getDataElementsInGroup(this.dhisApi, dataElementGroupCode, true);
      dataElementCodes = Object.keys(dataElements);
    }

    const { results } = await super.fetchAnalytics(dataElementCodes);
    return results;
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
