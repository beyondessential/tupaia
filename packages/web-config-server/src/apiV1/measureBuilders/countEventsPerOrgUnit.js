/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';

export class CountEventsPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  async fetchResults() {
    const { organisationUnitGroupCode } = this.query;

    return this.fetchEvents({
      dataValueFormat: 'object',
      organisationUnitCode: organisationUnitGroupCode,
    });
  }
}

export const countEventsPerOrgUnit = async (aggregator, dhisApi, query, measureBuilderConfig) => {
  const builder = new CountEventsPerOrgUnitBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
  );
  return builder.build();
};
