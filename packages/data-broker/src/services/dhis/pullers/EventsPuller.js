/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

import { buildEventsFromDhisEventAnalytics } from '../buildAnalytics';

export class EventsPuller {
  constructor(dataSourceModel, translator) {
    this.dataSourceModel = dataSourceModel;
    this.translator = translator;
  }

  /**
   * This is a deprecated method which invokes a slow DHIS2 api ('/events')
   * and returns an obsolete data structure (equivalent to the raw DHIS2 events).
   * It is invoked using the `options.useDeprecatedApi` flag
   *
   * TODO Delete this method as soon as all its past consumers have migrated over to
   * the new (non-deprecated) method
   */
  pullEventsForApi_Deprecated = async (api, programCode, options) => {
    const {
      organisationUnitCodes = [],
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
    } = options;

    const events = await api.getEvents({
      programCode,
      dataElementIdScheme: 'code',
      organisationUnitCode: organisationUnitCodes[0],
      dataValueFormat: 'object',
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
    });

    return this.translator.translateInboundEvents(events, programCode);
  };

  pullEventsForApi = async (api, programCode, options) => {
    const { dataElementCodes = [], organisationUnitCodes, period, startDate, endDate } = options;

    const dataElementSources = await this.dataSourceModel.find({
      code: dataElementCodes,
      type: this.dataSourceModel.getTypes().DATA_ELEMENT,
    });
    const dhisElementCodes = dataElementSources.map(({ dataElementCode }) => dataElementCode);

    const eventAnalytics = await api.getEventAnalytics({
      programCode,
      dataElementCodes: dhisElementCodes,
      organisationUnitCodes,
      period,
      startDate,
      endDate,
      dataElementIdScheme: 'code',
    });

    const translatedEventAnalytics = await this.translator.translateInboundEventAnalytics(
      eventAnalytics,
      dataElementSources,
    );

    return buildEventsFromDhisEventAnalytics(translatedEventAnalytics, dataElementCodes);
  };

  pull = async (apis, dataSources, options) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    // TODO remove `useDeprecatedApi` option as soon as `pullEventsForApi_Deprecated()` is deleted
    const { useDeprecatedApi = false } = options;
    const pullEventsForApi = useDeprecatedApi
      ? this.pullEventsForApi_Deprecated
      : this.pullEventsForApi;

    const events = [];
    const pullForApi = async api => {
      const newEvents = await pullEventsForApi(api, programCode, options);
      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return events;
  };
}
