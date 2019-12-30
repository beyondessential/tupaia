/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';
import { groupEventsByOrgUnit } from '/dhis';

export class CountEventsPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  groupResultsByOrgUnitCode = groupEventsByOrgUnit;

  async fetchResults() {
    const { organisationUnitGroupCode } = this.query;

    return this.getEvents({
      dataElementIdScheme: 'code',
      dataValueFormat: 'object',
      organisationUnitCode: organisationUnitGroupCode,
    });
  }
}

export const countEventsPerOrgUnit = async (dhisApi, query, measureBuilderConfig) => {
  const builder = new CountEventsPerOrgUnitBuilder(dhisApi, measureBuilderConfig, query);
  return builder.build();
};
