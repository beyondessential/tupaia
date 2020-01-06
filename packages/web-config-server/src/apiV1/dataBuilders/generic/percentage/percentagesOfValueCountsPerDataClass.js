/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues } from '/apiV1/dataBuilders/helpers';

export class PercentagesOfValueCountsPerDataClassBuilder extends DataBuilder {
  getAllDataElementCodes() {
    return Object.values(this.config.dataClasses).reduce(
      (codes, { numerator, denominator }) =>
        codes.concat(Object.keys(numerator.dataValues), Object.keys(denominator.dataValues)),
      [],
    );
  }

  /**
   * @returns {DataValuesOutput}
   */
  async build() {
    const results = await this.fetchResults();
    const data = this.buildData(results);

    return { data: this.areDataAvailable(data) ? data : [] };
  }

  async fetchResults() {
    const { results } = await this.getAnalytics({
      dataElementCodes: this.getAllDataElementCodes(),
      outputIdScheme: 'code',
    });
    return results;
  }

  buildData(analytics) {
    const dataClasses = [];
    Object.entries(this.config.dataClasses).forEach(([name, dataClass]) => {
      const [numerator, denominator] = this.calculateFractionPartsForDataClass(
        dataClass,
        analytics,
      );

      const data = {
        value: divideValues(numerator, denominator),
        name,
        numerator,
        denominator,
      };

      dataClasses.push(data);
    });

    return dataClasses;
  }

  calculateFractionPartsForDataClass(dataClass, analytics) {
    const { numerator, denominator } = dataClass;
    const numeratorValue = this.countAnalyticsThatSatisfyConditions(analytics, numerator);
    const denominatorValue = this.countAnalyticsThatSatisfyConditions(analytics, denominator);

    return [numeratorValue, denominatorValue];
  }
}

export const percentagesOfValueCountsPerDataClass = async (
  { dataBuilderConfig, query, organisationUnitInfo },
  dhisApi,
) => {
  const builder = new PercentagesOfValueCountsPerDataClassBuilder(
    dhisApi,
    dataBuilderConfig,
    query,
    organisationUnitInfo,
  );

  return builder.build();
};
