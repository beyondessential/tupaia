/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';
import { DhisTranslator } from './DhisTranslator';
import { buildAnalyticsFromAggregateData } from './buildAnalyticsFromAggregateData';
import { buildAnalyticsFromEvents } from './buildAnalyticsFromEvents';

const DEFAULT_DATA_SERVICE = { isDataRegional: true };
const DEFAULT_DATA_SERVICES = [DEFAULT_DATA_SERVICE];

export class DhisService extends Service {
  constructor(...args) {
    super(...args);
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
    this.translator = new DhisTranslator(this.models);
  }

  get dataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  getPushers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pushAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pushEvents.bind(this),
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

  getMetadataPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullDataElementMetadata.bind(this),
    };
  }

  getApiForValue = (dataSource, dataValue) => {
    const { isDataRegional } = dataSource.config;
    const { orgUnit: entityCode } = dataValue;
    return getDhisApiInstance({ entityCode, isDataRegional });
  };

  validatePushData(dataSources, dataValues) {
    if (dataSources.length !== dataValues.length) {
      throw new Error('Different number of data sources and values provided to push');
    }
    const { serverName } = this.getApiForValue(dataSources[0], dataValues[0]);
    if (
      dataSources.some(
        (dataSource, i) => this.getApiForValue(dataSource, dataValues[i]).serverName !== serverName,
      )
    ) {
      throw new Error('All data being pushed must be for the same DHIS2 instance');
    }
  }

  async push(dataSources, data) {
    const pushData = this.pushers[dataSources[0].type]; // all are of the same type
    const dataValues = Array.isArray(data) ? data : [data];
    this.validatePushData(dataSources, dataValues);
    const api = this.getApiForValue(dataSources[0], dataValues[0]); // all are for the same instance
    const diagnostics = await pushData(api, dataValues, dataSources);
    return { diagnostics, serverName: api.getServerName() };
  }

  async pushAggregateData(api, dataValues, dataSources) {
    const translatedDataValues = await this.translator.translateOutboundDataValues(
      api,
      dataValues,
      dataSources,
    );
    return api.postDataValueSets(translatedDataValues);
  }

  async pushEvents(api, events) {
    const translatedEvents = await Promise.all(
      events.map(event => this.translator.translateOutboundEvent(api, event)),
    );
    return api.postEvents(translatedEvents);
  }

  async delete(dataSource, data, { serverName } = {}) {
    const api = serverName
      ? getDhisApiInstance({ serverName })
      : this.getApiForValue(dataSource, data);
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
    const { organisationUnitCode: entityCode, dataServices = DEFAULT_DATA_SERVICES } = options;
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

  pullEventAnalytics = async (api, dataSources, options) => {
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
    const translatedEvents = await this.translator.translateInboundEvents(events, programCode);

    return buildAnalyticsFromEvents(api, translatedEvents);
  };

  pullAggregateAnalytics = async (api, dataSources, options) => {
    const dataElementCodes = dataSources.map(({ dataElementCode }) => dataElementCode);
    const { organisationUnitCode, period, startDate, endDate } = options;

    const aggregateData = await api.getAnalytics({
      dataElementCodes,
      outputIdScheme: 'code',
      organisationUnitCode,
      period,
      startDate,
      endDate,
    });

    const translatedData = this.translator.translateInboundAggregateData(
      aggregateData,
      dataSources,
    );

    return buildAnalyticsFromAggregateData(translatedData);
  };

  pullAnalytics = async (apis, dataSources, options) => {
    const pullMethod = this.getPullAnalyticsMethod(options);

    const response = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    const pullForApi = async api => {
      const { results, metadata } = await pullMethod(api, dataSources, options);
      response.results.push(...results);
      // Only the final query's metadata will be used in the result
      response.metadata = metadata;
    };

    await Promise.all(apis.map(pullForApi));
    return response;
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

    const events = [];
    const pullForApi = async api => {
      const newEvents = await api.getEvents({
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

      events.push(...newEvents);
    };

    await Promise.all(apis.map(pullForApi));
    return this.translator.translateInboundEvents(events, programCode);
  };

  async pullMetadata(dataSources, type, options) {
    const { organisationUnitCode: entityCode, dataServices = DEFAULT_DATA_SERVICES } = options;
    const pullMetadata = this.metadataPullers[type];
    const apis = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCode, isDataRegional }),
    );

    const results = [];
    const pullForApi = async api => {
      const newResults = await pullMetadata(api, dataSources, options);
      results.push(...newResults);
    };
    await Promise.all(apis.map(pullForApi));

    return results;
  }

  async pullDataElementMetadata(api, dataSources, options) {
    const dataElementCodes = dataSources.map(({ dataElementCode }) => dataElementCode);
    const { includeOptions } = options;
    const dataElements = await api.fetchDataElements(dataElementCodes, { includeOptions });
    return this.translator.translateInboundDataElements(dataElements, dataSources);
  }
}
