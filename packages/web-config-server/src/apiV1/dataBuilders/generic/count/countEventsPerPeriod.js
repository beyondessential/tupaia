/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataPerPeriodBuilder } from 'apiV1/dataBuilders/DataPerPeriodBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';
import { groupEventsByPeriod } from '/dhis';

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
    return this.getEvents({ dataElementIdScheme: 'code', dataValueFormat: 'object' });
  }
}

export const countEventsPerPeriod = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new CountEventsPerPeriodBuilder(dhisApi, dataBuilderConfig, query, entity);

  return builder.build();
};
