/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

export class GetStringsFromBinaryDataBuilder extends DataBuilder {
  async build() {
    const { dataElementToString } = this.config;
    const { results } = await this.fetchAnalytics(Object.keys(dataElementToString));

    const stringArrayByOrgUnit = [];
    results.forEach(({ dataElement, value, organisationUnit }) => {
      const stringValue = value ? dataElementToString[dataElement] : '';
      if (stringValue) {
        stringArrayByOrgUnit[organisationUnit] = [stringValue].concat(
          stringArrayByOrgUnit[organisationUnit],
        );
      }
    });

    return Object.entries(stringArrayByOrgUnit).map(([organisationUnitCode, valueArray]) => ({
      organisationUnitCode,
      value: valueArray.join(', '),
    }));
  }
}

export const getStringsFromBinaryData = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig = {},
  entity,
) => {
  const builder = new GetStringsFromBinaryDataBuilder(
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
