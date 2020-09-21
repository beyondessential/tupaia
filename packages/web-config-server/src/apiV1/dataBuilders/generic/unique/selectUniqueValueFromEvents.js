/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';
import { uniqueValueFromEvents } from '/apiV1/dataBuilders/helpers';

export class SelectUniqueValueFromEventsBuilder extends DataBuilder {
  async build() {
    const events = await this.fetchResults();
    const data = await this.buildData(events);

    return { data };
  }

  async fetchResults() {
    const dataElementCodes = this.getDataElementCodes();
    const events = await this.fetchEvents({ useDeprecatedApi: false, dataElementCodes });
    return events;
  }

  getDataElementCodes() {
    return Object.keys(this.config.dataValues || {});
  }

  async buildData(events) {
    const { valueToSelect } = this.config;
    const value = uniqueValueFromEvents(events, { valueToSelect });

    return [{ name: valueToSelect, value }];
  }
}

export const selectUniqueValueFromEvents = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SelectUniqueValueFromEventsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
  );
  return builder.build();
};
