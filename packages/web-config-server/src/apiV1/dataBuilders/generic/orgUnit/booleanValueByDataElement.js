import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class BooleanValueByDataElementsBuilder extends DataBuilder {
  async build() {
    const { dataElementToString } = this.config;
    const elementCodes = Object.keys(dataElementToString);
    const { results } = await this.fetchAnalytics(elementCodes, {
      organisationUnitCode: this.entity.code,
    });

    const booleanArrayByDataElement = {};
    elementCodes.map(code => (booleanArrayByDataElement[dataElementToString[code]] = 0));

    if (!results) {
      return { data: wrapResults(booleanArrayByDataElement) };
    }

    results.forEach(({ dataElement, value }) => {
      if (value === 'Yes') {
        booleanArrayByDataElement[dataElementToString[dataElement]] = 1;
      }
    });

    return { data: wrapResults(booleanArrayByDataElement) };
  }
}
const wrapResults = responseObject => {
  return Object.keys(responseObject).map(key => ({
    name: key,
    value: responseObject[key],
  }));
};

export const booleanValueByDataElements = async (
  { models, dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new BooleanValueByDataElementsBuilder(
    models,
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  const responseObject = await builder.build();

  return responseObject;
};
