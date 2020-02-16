/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { groupEventsByPeriod } from '@tupaia/dhis-api';
import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';

/**
 * Configuration schema
 * @typedef {Object} CountEventsConfig
 * @property {string} programCode
 * @property {string} periodType
 * @property {Object<string, DataValueCondition>} [dataValues]
 *
 * Example
 * ```js
 * {
 *   programCode: 'SCRF',
 *   periodType: 'month'
 *   dataValues: { STR_CRF125: '1' }
 * }
 * ```
 */

class CountEventsPerPeriodBuilder extends DataPerPeriodBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  groupResultsByPeriod = groupEventsByPeriod;

  async fetchResults() {
    return this.fetchEvents({ dataValueFormat: 'object' });
  }
}

export const countEventsPerPeriod = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new CountEventsPerPeriodBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );

  return builder.build();
};
