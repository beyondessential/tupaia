/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { divideValues } from '/apiV1/dataBuilders/helpers';

/**
 * Configuration schema
 * @typedef {Object} PercentagesOfEventCountsConfig
 * @property {string} programCode
 * @property {Object<string, EventPercentage>} dataClasses
 *
 * Example
 * ```js
 * {
 *   programCode: 'SCRF',
 *   dataClasses: {
 *     Male: {
 *       numerator: { dataValues: { STR_CRF15: 'Male' } },
 *       denominator: { dataValues: { STR_CRF125: '1' } },
 *     },
 *     Female: {
 *       numerator: { dataValues: { STR_CRF15: 'Female' } },
 *       denominator: { dataValues: { STR_CRF125: '1' } },
 *     },
 *     "Older than 5 years": {
 *       numerator: { dataValues: { STR_CRF12: { operator: '>=', value: 5 } } },
 *       denominator: { dataValues: { STR_CRF125: '1' } },
 *     },
 *   }
 * }
 * ```
 */

export class PercentagesOfEventCountsBuilder extends DataBuilder {
  /**
   * @returns {DataValuesOutput}
   */
  async build() {
    const events = await this.fetchEvents({ dataValueFormat: 'object' });
    const data = this.buildData(events);

    return { data: this.areDataAvailable(data) ? data : [] };
  }

  buildData(events) {
    return Object.entries(this.config.dataClasses).map(([name, dataClass]) => {
      const [numerator, denominator] = this.calculateFractionPartsForDataClass(dataClass, events);

      return {
        name,
        value: divideValues(numerator, denominator),
        [`${name}_metadata`]: {
          numerator,
          denominator,
        },
      };
    });
  }

  calculateFractionPartsForDataClass(dataClass, events) {
    const { numerator, denominator } = dataClass;
    const numeratorValue = this.countEventsThatSatisfyConditions(events, numerator);
    const denominatorValue = this.countEventsThatSatisfyConditions(events, denominator);

    return [numeratorValue, denominatorValue];
  }
}

export const percentagesOfEventCounts = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new PercentagesOfEventCountsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
