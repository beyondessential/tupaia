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

    const events = [];
    const pullForApi = async api => {
      const newEvents = await this.pullEventsForApi(api, programCode, options);
      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return events;
  };
}
