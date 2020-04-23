/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';

export class CountEventsPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  async fetchResults() {
    return this.fetchEvents({
      dataValueFormat: 'object',
      organisationUnitCode: this.entity.code,
    });
  }
}

export const countEventsPerOrgUnit = async (
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new CountEventsPerOrgUnitBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
