/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

/**
 * Configuration schema
 * @typedef {Object} CountEventsConfig
 * @property {string} programCode
 * @property {Object<string, DataValueCondition>} [dataValues]
 *
 * Example
 * ```js
 * {
 *   programCode: 'SCRF',
 *   dataValues: { STR_CRF125: '1' }
 * }
 * ```
 */

export class CountEventsBuilder extends DataBuilder {
  /**
   * @returns {DataValuesOutput}
   */
  async build() {
    const events = await this.fetchEvents({ dataValueFormat: 'object' });
    const data = this.buildData(events);

    return { data };
  }

  buildData(events) {
    const { dataValues } = this.config;
    const value = this.countEventsThatSatisfyConditions(events, { dataValues });

    return [{ name: 'countEvents', value }];
  }
}

export const countEvents = async ({ dataBuilderConfig, query, entity }, aggregator, dhisApi) => {
  const builder = new CountEventsBuilder(aggregator, dhisApi, dataBuilderConfig, query, entity);
  return builder.build();
};
