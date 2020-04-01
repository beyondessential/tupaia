/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { CountEventsBuilder } from '/apiV1/dataBuilders/generic/count/countEvents';
import { mapMeasureValuesToGroups } from './helpers';

export class GroupEventsPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => CountEventsBuilder;

  async fetchResults() {
    const { organisationUnitGroupCode } = this.query;

    return this.fetchEvents({
      dataValueFormat: 'object',
      organisationUnitCode: organisationUnitGroupCode,
    });
  }

  formatData(data) {
    const { groups } = this.config;
    const { dataElementCode } = this.query;

    return data.map(dataElement => mapMeasureValuesToGroups(dataElement, dataElementCode, groups));
  }
}

export const groupEventsPerOrgUnit = async (aggregator, dhisApi, query, measureBuilderConfig) => {
  const builder = new GroupEventsPerOrgUnitBuilder(
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
  );
  return builder.build();
};
