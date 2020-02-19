/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';
import { DhisTranslator } from './DhisTranslator';
import { translateAggregateDataToAnalytics } from './translateAggregateDataToAnalytics';
import { translateEventsToAnalytics } from './translateEventsToAnalytics';

export class DhisService extends Service {
  constructor(...args) {
    super(...args);
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.translator = new DhisTranslator(this.models);
  }

  get dataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  getPushers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pushAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pushEvent.bind(this),
    };
  }

  getDeleters() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.deleteAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.deleteEvent.bind(this),
    };
  }

  getPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAnalytics.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvents.bind(this),
    };
  }

  async push(dataSource, data) {
    const { isDataRegional } = dataSource.config;
    const { orgUnit: entityCode } = data;
    const api = getDhisApiInstance({ entityCode, isDataRegional });
    const pushData = this.pushers[dataSource.type];
    const diagnostics = await pushData(api, data, dataSource);

    return { diagnostics, serverName: api.getServerName() };
  }

  async pushAggregateData(api, dataValue, dataSource) {
    const translatedDataValue = await this.translator.translateOutboundDataValue(
      api,
      dataValue,
      dataSource,
    );
    return api.postDataValueSets([translatedDataValue]);
  }

  async pushEvent(api, event) {
    const translatedEvent = await this.translator.translateOutboundEvent(api, event);
    return api.postEvents([translatedEvent]);
  }

  async delete(dataSource, data, { serverName }) {
    const api = getDhisApiInstance({ serverName });
    const deleteData = this.deleters[dataSource.type];
    return deleteData(api, data, dataSource);
  }

  async deleteAggregateData(api, dataValue, dataSource) {
    const translatedDataValue = await this.translator.translateOutboundDataValue(
      api,
      dataValue,
      dataSource,
    );
    return api.deleteDataValue(translatedDataValue);
  }

  deleteEvent = async (api, data) => api.deleteEvent(data.dhisReference);

  async pull(dataSources, type, options = {}) {
    const { organisationUnitCode: entityCode, dataServices = [] } = options;
    const pullData = this.pullers[type];
    const apis = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCode, isDataRegional }),
    );

    return pullData(apis, dataSources, options);
  }

  getPullAnalyticsMethod = options => {
    const { programCodes, eventId } = options;
    return programCodes || eventId ? this.pullEventAnalytics : this.pullAggregateAnalytics;
  };

  fetchEventsForPrograms = async (api, programCodes, query) => {
    const events = [];
    await Promise.all(
      programCodes.map(async programCode => {
        const newEvents = await api.getEvents({ ...query, programCode });
        events.push(...newEvents);
      }),
    );

    return events;
  };

  pullEventAnalytics = async (api, options) => {
    const {
      organisationUnitCode,
      startDate,
      endDate,
      programCodes,
      programCode,
      eventId,
      trackedEntityInstance,
    } = options;

    const query = {
      organisationUnitCode,
      dataElementIdScheme: 'code',
      startDate,
      endDate,
      programCodes,
      programCode,
      eventId,
      trackedEntityInstance,
    };
    const events = await this.fetchEventsForPrograms(api, programCodes || [programCode], query);

    return translateEventsToAnalytics(api, events);
  };

  pullAggregateAnalytics = async (api, options) => {
    const { dataElementCodes, organisationUnitCode, period, startDate, endDate } = options;

    const response = await api.getAnalytics({
      dataElementCodes,
      outputIdScheme: 'code',
      organisationUnitCode,
      period,
      startDate,
      endDate,
    });

    return translateAggregateDataToAnalytics(response);
  };

  pullAnalytics = async (apis, dataSources, options) => {
    const dataElementCodes = dataSources.map(this.translator.dataSourceToElementCode);
    const pullMethod = this.getPullAnalyticsMethod(options);

    const response = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
        dataElementIdToCode: {},
      },
    };
    const pullForApi = async api => {
      const { results, metadata } = await pullMethod(api, { ...options, dataElementCodes });
      response.results.push(...results);
      response.metadata = { ...response.metadata, ...metadata };
    };

    await Promise.all(apis.map(pullForApi));
    return this.translator.translateInboundAnalytics(response, dataSources);
  };

  pullEvents = async (apis, dataSources, options) => {
    const {
      organisationUnitCode,
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
      dataValueFormat,
    } = options;

    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    const response = [];
    const pullForApi = async api => {
      const events = await api.getEvents({
        programCode,
        dataElementIdScheme: 'code',
        organisationUnitCode,
        orgUnitIdScheme,
        startDate,
        endDate,
        eventId,
        trackedEntityInstance,
        dataValueFormat,
      });

      response.push(...events);
    };

    await Promise.all(apis.map(pullForApi));
    return this.translator.translateInboundEvents(response, programCode);
  };
}
