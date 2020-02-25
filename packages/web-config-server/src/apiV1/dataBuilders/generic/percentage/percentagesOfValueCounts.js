/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues } from '/apiV1/dataBuilders/helpers';

const ORG_UNIT_COUNT = '$orgUnitCount';

export class PercentagesOfValueCountsBuilder extends DataBuilder {
  getDataElementCodes() {
    return Object.values(this.config.dataClasses).reduce(
      (codes, { numerator, denominator }) =>
        codes.concat(
          Object.keys(numerator.dataValues),
          denominator.hasOwnProperty('dataValues') && Object.keys(denominator.dataValues),
        ),
      [],
    );
  }

  /**
   * @returns {DataValuesOutput}
   */
  async build() {
    const results = await this.fetchResults();
    const data = await this.buildData(results);

    return { data: this.areDataAvailable(data) ? data : [] };
  }

  async fetchResults() {
    const dataElementCodes = this.getDataElementCodes();
    const { results } = await this.fetchAnalytics(dataElementCodes);
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
        [`${name}_metadata`]: {
          numerator,
          denominator,
        },
      };

      dataClasses.push(data);
    });

    return dataClasses;
  }

  calculateFractionPartsForDataClass(dataClass, analytics) {
    const { numerator, denominator } = dataClass;
    const numeratorValue = this.countAnalyticsThatSatisfyConditions(analytics, numerator);
    let denominatorValue;

    if (denominator === ORG_UNIT_COUNT) {
      denominatorValue = [...new Set(analytics.map(data => data.organisationUnit))].length;
    } else {
      denominatorValue = this.countAnalyticsThatSatisfyConditions(analytics, denominator);
    }

    return [numeratorValue, denominatorValue];
  }
}

export const percentagesOfValueCounts = async (
  { dataBuilderConfig, query, organisationUnitInfo },
  aggregator,
  dhisApi,
) => {
  const builder = new PercentagesOfValueCountsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    organisationUnitInfo,
  );

  return builder.build();
};
