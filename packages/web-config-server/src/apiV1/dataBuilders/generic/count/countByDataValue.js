import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

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
  countByDataValue(queryConfig, aggregator, dhisApi, AGGREGATION_TYPES.RAW);
