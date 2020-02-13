/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import { AGGREGATION_TYPES } from '@tupaia/dhis-api';
import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

const buildResponse = rawData => {
  return rawData.map(x => ({
    ...x,
    name: moment(x.period).format('YYYY'),
  }));
};

class SimpleTableOfEventsBuilder extends DataBuilder {
  async build() {
    const events = await this.fetchEvents();
    const results = buildResponse(events.results);
    return { data: results };
  }

  async fetchEvents() {
    const events = await this.getAnalytics({
      dataElementCodes: this.config.dataElementCodes,
    });

    return events;
  }
}

export const simpleTableOfEvents = async (
  { dataBuilderConfig, query, entity },
  aggregator,
  dhisApi,
) => {
  const builder = new SimpleTableOfEventsBuilder(
    aggregator,
    dhisApi,
    dataBuilderConfig,
    query,
    entity,
    AGGREGATION_TYPES.FINAL_EACH_YEAR,
  );
  return builder.build();
};
