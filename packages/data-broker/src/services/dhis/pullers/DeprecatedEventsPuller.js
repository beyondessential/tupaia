/**
 * Tupaia
 * Copyright (c) 2017 - 2021 Beyond Essential Systems Pty Ltd
 */

export class DeprecatedEventsPuller {
  constructor(dataSourceModel, translator) {
    this.dataSourceModel = dataSourceModel;
    this.translator = translator;
  }

  /**
   * This is a deprecated method which invokes a slow DHIS2 api ('/events')
   * and returns an obsolete data structure (equivalent to the raw DHIS2 events).
   * It is invoked using the `options.useDeprecatedApi` flag
   *
   * TODO Delete this puller as soon as all its past consumers have migrated over to
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

  pull = async (apis, dataSources, options) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    const events = [];
    const pullForApi = async api => {
      const newEvents = await this.pullEventsForApi_Deprecated(api, programCode, options);
      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return events;
  };
}
