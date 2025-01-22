import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class GetStringsFromBinaryDataBuilder extends DataBuilder {
  async build() {
    const { dataElementToString, delimiter = ', ' } = this.config;
    const { period, results } = await this.fetchAnalytics(Object.keys(dataElementToString));

    const stringArrayByOrgUnit = [];
    results.forEach(({ dataElement, value, organisationUnit }) => {
      let stringValue;

      if (typeof dataElementToString[dataElement] === 'object') {
        const { valueOfInterest, displayString } = dataElementToString[dataElement];
        if (valueOfInterest === value) {
          stringValue = displayString;
        }
      } else {
        stringValue = value ? dataElementToString[dataElement] : '';
      }

      if (stringValue) {
        if (stringArrayByOrgUnit[organisationUnit]) {
          stringArrayByOrgUnit[organisationUnit].push(stringValue);
        } else {
          stringArrayByOrgUnit[organisationUnit] = [stringValue];
        }
      }
    });

    return {
      data: Object.entries(stringArrayByOrgUnit).map(([organisationUnitCode, valueArray]) => ({
        organisationUnitCode,
        value: valueArray.join(delimiter),
      })),
      period,
    };
  }
}

export const getStringsFromBinaryData = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new GetStringsFromBinaryDataBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
    measureBuilderConfig.aggregationType,
  );
  const responseObject = await builder.build();

  return responseObject;
};
