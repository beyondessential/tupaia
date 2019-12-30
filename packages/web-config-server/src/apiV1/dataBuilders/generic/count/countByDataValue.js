import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { AGGREGATION_TYPES } from '/dhis';

class CountByDataValueBuilder extends DataBuilder {
  async build() {
    const { valuesOfInterest } = this.config;
    const { results } = await this.getAnalytics(this.config);

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
}

function countByDataValue({ dataBuilderConfig, query, entity }, dhisApi, aggregationType) {
  const builder = new CountByDataValueBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    aggregationType,
  );
  return builder.build();
}

export const countByLatestDataValues = async (queryConfig, dhisApi) =>
  countByDataValue(queryConfig, dhisApi);

export const countByAllDataValues = async (queryConfig, dhisApi) =>
  countByDataValue(queryConfig, dhisApi, AGGREGATION_TYPES.RAW);
