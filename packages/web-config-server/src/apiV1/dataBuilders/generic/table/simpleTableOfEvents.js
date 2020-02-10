/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */
import moment from 'moment';
import { DataBuilder } from '/apiV1/dataBuilders/DataBuilder';

class SimpleTableOfEventsBuilder extends DataBuilder {
  async build() {
    const events = await this.fetchEvents();
    const returnData = this.buildResponse(events);
    return { data: returnData };
  }

  buildResponse(rawData) {
    return rawData.map(x => ({
      organisationUnit: x.orgUnit,
      period: x.created,
      dataElementCode: x.event,
      dataElementId: x.event,
      name: moment(x.eventDate).format('YYYY'),
      value: x.dataValues[this.config.dataElementCode].value,
    }));
  }

  async fetchEvents() {
    const { organisationUnitCode } = this.query;
    const events = await this.getEvents({
      organisationUnitCode,
      dataElementIdScheme: 'code',
      dataValueFormat: 'object',
    });

    return events;
  }
}

export const simpleTableOfEvents = async ({ dataBuilderConfig, query, entity }, dhisApi) => {
  const builder = new SimpleTableOfEventsBuilder(dhisApi, dataBuilderConfig, query, entity);
  return await builder.build();
};
