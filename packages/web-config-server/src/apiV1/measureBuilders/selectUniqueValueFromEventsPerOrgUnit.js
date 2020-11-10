/**
 * Tupaia Config Server
 * Copyright (c) 2020 Beyond Essential Systems Pty Ltd
 */

import { DataPerOrgUnitBuilder } from './DataPerOrgUnitBuilder';
import { SelectUniqueValueFromEventsBuilder } from '/apiV1/dataBuilders/generic/unique/selectUniqueValueFromEvents';

export class SelectUniqueValueFromEventsPerOrgUnitBuilder extends DataPerOrgUnitBuilder {
  getBaseBuilderClass = () => SelectUniqueValueFromEventsBuilder;

  async fetchResultsAndPeriod() {
    const dataElementCodes = Object.keys(this.config.dataValues);
    return {
      results: await this.fetchEvents({ dataElementCodes, useDeprecatedApi: false }),
      period: null,
    };
  }
}

export const selectUniqueValueFromEventsPerOrgUnit = async (
  models,
  aggregator,
  dhisApi,
  query,
  measureBuilderConfig,
  entity,
) => {
  const builder = new SelectUniqueValueFromEventsPerOrgUnitBuilder(
    models,
    aggregator,
    dhisApi,
    measureBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
