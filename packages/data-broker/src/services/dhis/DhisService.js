/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import groupBy from 'lodash.groupby';

import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';
import { DhisTranslator } from './DhisTranslator';
import {
  buildAnalyticsFromDhisAnalytics,
  buildAnalyticsFromDhisEventAnalytics,
  buildAnalyticsFromEvents,
  buildEventsFromDhisEventAnalytics,
} from './buildAnalytics';

const DEFAULT_DATA_SERVICE = { isDataRegional: true };
const DEFAULT_DATA_SERVICES = [DEFAULT_DATA_SERVICE];
const DHIS_DATA_ELEMENT_TYPES = {
  DATA_ELEMENT: 'DataElement',
  INDICATOR: 'Indicator',
};

export class DhisService extends Service {
  constructor(models) {
    super(models);

    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
    this.translator = new DhisTranslator(this.models);
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
    return getDhisApiInstance({ entityCode, isDataRegional }, this.models);
  };

  validatePushData(dataSources, dataValues) {
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
      ? getDhisApiInstance({ serverName }, this.models)
      : this.getApiForValue(dataSource, data);
    const deleteData = this.deleters[dataSource.type];
    return deleteData(api, data, dataSource);
  }

  async deleteAggregateData(api, dataValue, dataSource) {
    const [translatedDataValue] = await this.translator.translateOutboundDataValues(
      api,
      [dataValue],
      [dataSource],
    );
    return api.deleteDataValue(translatedDataValue);
  }

  deleteEvent = async (api, data) => api.deleteEvent(data.dhisReference);

  async pull(dataSources, type, options = {}) {
    const {
      organisationUnitCode,
      organisationUnitCodes,
      dataServices = DEFAULT_DATA_SERVICES,
    } = options;
    const entityCodes = organisationUnitCodes || [organisationUnitCode];
    const pullData = this.pullers[type];
    const apis = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCodes, isDataRegional }, this.models),
    );

    return pullData(apis, dataSources, options);
  }

  getPullAnalyticsForApiMethod = options => {
    const { programCodes, dhisDataType } = options;

    if (programCodes) {
      // TODO remove `useDeprecatedApi` option as soon as `pullAnalyticsFromEventsForApi_Deprecated()` is deleted
      const { useDeprecatedApi = true } = options;
      return useDeprecatedApi
        ? this.pullAnalyticsFromEventsForApi_Deprecated
        : this.pullAnalyticsFromEventsForApi;
    }

    return dhisDataType === DHIS_DATA_ELEMENT_TYPES.INDICATOR
      ? this.pullAggregatedAnalyticsForApi
      : this.pullAnalyticsForApi;
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

  fetchEventAnalyticsForPrograms = async (api, programCodes, query) => {
    const allHeaders = [];
    let metaData = { items: {}, dimensions: {} };
    let width = 0;
    let height = 0;
    const rows = [];

    const fetchAnalyticsForProgram = async programCode => {
      const newAnalytics = await api.getEventAnalytics({ ...query, programCode });

      allHeaders.push(...newAnalytics.headers);
      metaData = {
        items: { ...metaData.items, ...newAnalytics.metaData.items },
        dimensions: { ...metaData.dimensions, ...newAnalytics.metaData.dimensions },
      };
      width = newAnalytics.width;
      height += newAnalytics.height;
      rows.push(...newAnalytics.rows);
    };

    await Promise.all(programCodes.map(fetchAnalyticsForProgram));
    return {
      headers: Object.values(keyBy(allHeaders, 'name')),
      metaData,
      width,
      height,
      rows,
    };
  };

  /**
   * This is a deprecated method which invokes a slow DHIS2 api ('/events').
   * It is invoked using the `options.useDeprecatedApi` flag
   *
   * TODO Delete this method as soon as all its past consumers have migrated over to
   * the new (non-deprecated) method
   */
  pullAnalyticsFromEventsForApi_Deprecated = async (api, dataSources, options) => {
    const {
      organisationUnitCodes = [],
      startDate,
      endDate,
      programCodes,
      eventId,
      trackedEntityInstance,
    } = options;

    const query = {
      organisationUnitCode: organisationUnitCodes[0],
      dataElementIdScheme: 'code',
      startDate,
      endDate,
      programCodes,
      eventId,
      trackedEntityInstance,
    };
    const events = await this.fetchEventsForPrograms(api, programCodes, query);
    const translatedEvents = await this.translator.translateInboundEvents(events, programCodes[0]);
    const dataElements = await this.pullDataElementMetadata(api, dataSources, {
      additionalFields: ['valueType'],
    });

    return buildAnalyticsFromEvents(translatedEvents, dataElements);
  };

  pullAnalyticsFromEventsForApi = async (api, dataSources, options) => {
    const {
      programCodes = [],
      period,
      startDate,
      endDate,
      organisationUnitCode,
      organisationUnitCodes,
    } = options;
    const dataElementCodes = dataSources.map(({ code }) => code);
    const dhisElementCodes = dataSources.map(({ dataElementCode }) => dataElementCode);

    const query = {
      programCodes,
      dataElementCodes: dhisElementCodes,
      dataElementIdScheme: 'code',
      organisationUnitCodes: organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes,
      period,
      startDate,
      endDate,
    };
    const eventAnalytics = await this.fetchEventAnalyticsForPrograms(api, programCodes, query);

    const translatedEventAnalytics = await this.translator.translateInboundEventAnalytics(
      eventAnalytics,
      dataSources,
    );

    return buildAnalyticsFromDhisEventAnalytics(translatedEventAnalytics, dataElementCodes);
  };

  getAnalyticsQueryParameters = (dataSources, options) => {
    const dataElementCodes = dataSources.map(({ dataElementCode }) => dataElementCode);
    const {
      organisationUnitCode,
      organisationUnitCodes,
      period,
      startDate,
      endDate,
      additionalDimensions,
    } = options;
    return {
      dataElementCodes,
      outputIdScheme: 'code',
      organisationUnitCodes: organisationUnitCode ? [organisationUnitCode] : organisationUnitCodes,
      period,
      startDate,
      endDate,
      additionalDimensions,
    };
  };

  pullAnalyticsForApi = async (api, dataSources, options) => {
    const queryInput = this.getAnalyticsQueryParameters(dataSources, {
      ...options,
      additionalDimensions: ['co'],
    });
    const rawData = await api.getAnalytics(queryInput);
    const translatedData = this.translator.translateInboundAggregateData(rawData, dataSources);
    return buildAnalyticsFromDhisAnalytics(translatedData);
  };

  pullAggregatedAnalyticsForApi = async (api, dataSources, options) => {
    const queryInput = this.getAnalyticsQueryParameters(dataSources, options);
    const aggregateData = await api.getAggregatedAnalytics(queryInput);
    const translatedData = this.translator.translateInboundAggregateData(
      aggregateData,
      dataSources,
    );
    return buildAnalyticsFromDhisAnalytics(translatedData);
  };

  pullAnalyticsForDhisDataType = async (apis, dataSources, options, dhisDataType) => {
    const pullAnalyticsForApi = this.getPullAnalyticsForApiMethod({ ...options, dhisDataType });

    const response = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    const pullForApi = async api => {
      const { results, metadata } = await pullAnalyticsForApi(api, dataSources, options);
      response.results.push(...results);
      response.metadata = {
        dataElementCodeToName: {
          ...(response.metadata?.dataElementCodeToName || {}),
          ...(metadata?.dataElementCodeToName || {}),
        },
      };
    };

    await Promise.all(apis.map(pullForApi));
    return response;
  };

  groupDataSourcesByDhisDataType = dataSources =>
    groupBy(dataSources, d => d.config?.dhisDataType || DHIS_DATA_ELEMENT_TYPES.DATA_ELEMENT);

  pullAnalytics = async (apis, dataSources, options) => {
    const dataSourcesByDhisType = this.groupDataSourcesByDhisDataType(dataSources);
    const response = {
      results: [],
      metadata: {
        dataElementCodeToName: {},
      },
    };
    // To support pulling analytics for both DataElement and Indicator at the same time
    const pullForDhisDataType = async (dhisDataType, groupedDataSources) => {
      const { results, metadata } = await this.pullAnalyticsForDhisDataType(
        apis,
        groupedDataSources,
        options,
        dhisDataType,
      );
      response.results.push(...results);
      response.metadata = {
        dataElementCodeToName: {
          ...(response.metadata?.dataElementCodeToName || {}),
          ...(metadata?.dataElementCodeToName || {}),
        },
      };
    };

    await Promise.all(
      Object.entries(dataSourcesByDhisType).map(([dhisDataType, groupedDataSources]) =>
        pullForDhisDataType(dhisDataType, groupedDataSources),
      ),
    );
    return response;
  };

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
      dataValueFormat,
    } = options;

    const events = await api.getEvents({
      programCode,
      dataElementIdScheme: 'code',
      organisationUnitCode: organisationUnitCodes[0],
      orgUnitIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
      dataValueFormat,
    });

    return this.translator.translateInboundEvents(events, programCode);
  };

  pullEventsForApi = async (api, programCode, options) => {
    const { dataElementCodes = [], organisationUnitCodes, period, startDate, endDate } = options;

    const dataElementSources = await this.models.dataSource.find({
      code: dataElementCodes,
      type: this.dataSourceTypes.DATA_ELEMENT,
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

  pullEvents = async (apis, dataSources, options) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    // TODO remove `useDeprecatedApi` option as soon as `pullEventsForApi_Deprecated()` is deleted
    const { useDeprecatedApi = true } = options;
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

  async pullMetadata(dataSources, type, options) {
    const { organisationUnitCode: entityCode, dataServices = DEFAULT_DATA_SERVICES } = options;
    const pullMetadata = this.metadataPullers[type];
    const apis = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCode, isDataRegional }, this.models),
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
    const dataSourcesByDhisType = this.groupDataSourcesByDhisDataType(dataSources);
    const metadata = [];

    for (const entry of Object.entries(dataSourcesByDhisType)) {
      const [dhisDataType, groupedDataSources] = entry;
      const dataElementCodes = groupedDataSources.map(({ dataElementCode }) => dataElementCode);
      if (dhisDataType === DHIS_DATA_ELEMENT_TYPES.INDICATOR) {
        const indicators = await api.fetchIndicators({ dataElementCodes });
        metadata.push(
          ...this.translator.translateInboundIndicators(indicators, groupedDataSources),
        );
      } else {
        const { additionalFields, includeOptions } = options;
        const dataElements = await api.fetchDataElements(dataElementCodes, {
          additionalFields,
          includeOptions,
        });
        metadata.push(
          ...this.translator.translateInboundDataElements(dataElements, groupedDataSources),
        );
      }
    }

    return metadata;
  }
}
