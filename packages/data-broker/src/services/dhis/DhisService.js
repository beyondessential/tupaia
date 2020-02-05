/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';

const dataSourceToElementCode = dataSource => dataSource.config.dataElementCode || dataSource.code;

export class DhisService extends Service {
  constructor(...args) {
    super(...args);
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
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
      [this.dataSourceTypes.DATA_ELEMENT]: this.pullAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pullEvent.bind(this),
    };
  }

  getValueToPush = async (api, dataElementCode, value) => {
    if (value === undefined) return value; // "delete" pushes don't include a value
    const options = await api.getOptionsForDataElement(dataElementCode);
    console.log(options);
    if (!options) return value; // no option set associated with that data element, use raw value
    const optionCode = options[value.toLowerCase()]; // Convert text to lower case so we can ignore case
    if (!optionCode) {
      throw new Error(`No option matching ${value} for data element ${dataElementCode}`);
    }
    return optionCode;
  };

  /**
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSource} dataSource
   */
  translateDataValue = async (api, dv, dataSource) => {
    const { value, dataElement, ...restOfDataValue } = dv;
    const dataElementCode = dataSourceToElementCode(dataSource);
    const valueToPush = await this.getValueToPush(api, dataElementCode, value);
    return {
      dataElement: dataElementCode,
      value: valueToPush,
      ...restOfDataValue,
    };
  };

  async translateEventDataValues(api, dataValues) {
    const dataSources = await this.models.dataSource.findOrDefault({
      code: dataValues.map(({ code }) => code),
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
    const dataValuesWithCodeReplaced = await Promise.all(
      dataValues.map((d, i) => this.translateDataValue(api, d, dataSources[i])),
    );
    const dataElementCodes = dataValuesWithCodeReplaced.map(({ dataElement }) => dataElement);
    const dataElementIds = await api.getIdsFromCodes(
      api.getResourceTypes().DATA_ELEMENT,
      dataElementCodes,
    );
    const dataValuesWithIds = dataValuesWithCodeReplaced.map((d, i) => ({
      ...d,
      dataElement: dataElementIds[i],
    }));
    return dataValuesWithIds;
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
    const translatedDataValue = await this.translateDataValue(api, dataValue, dataSource);
    return api.postDataValueSets([translatedDataValue]);
  }

  async pushEvent(api, { dataValues, ...restOfEvent }) {
    const translatedDataValues = await this.translateEventDataValues(api, dataValues);
    const event = { dataValues: translatedDataValues, ...restOfEvent };
    return api.postEvents([event]);
  }

  async delete(dataSource, data, { serverName }) {
    const api = getDhisApiInstance({ serverName });
    const deleteData = this.deleters[dataSource.type];
    return deleteData(api, data, dataSource);
  }

  async deleteAggregateData(api, dataValue, dataSource) {
    const translatedDataValue = await this.translateDataValue(api, dataValue, dataSource);
    return api.deleteDataValue(translatedDataValue);
  }

  deleteEvent = async (api, data) => api.deleteEvent(data.dhisReference);

  async pull(dataSources, type, options) {
    const { organisationUnitCode: entityCode, dataServices = [] } = options;
    const pullData = this.pullers[type];
    const apis = dataServices.map(({ isDataRegional }) =>
      getDhisApiInstance({ entityCode, isDataRegional }),
    );

    return pullData(apis, dataSources, options);
  }

  pullAggregateData = async (
    apis,
    dataSources,
    { outputIdScheme, organisationUnitCode, period, startDate, endDate },
  ) => {
    const dataElementCodes = dataSources.map(dataSourceToElementCode);

    const response = {
      results: [],
      metadata: {},
    };
    const pullForApi = async api => {
      const { results, metadata } = await api.getAnalytics({
        dataElementCodes,
        outputIdScheme,
        organisationUnitCode,
        period,
        startDate,
        endDate,
      });
      response.results.push(...results);
      response.metadata = { ...response.metadata, ...metadata };
    };

    await Promise.all(apis.map(pullForApi));
    return response;
  };

  pullEvent = async (
    apis,
    dataSources,
    {
      organisationUnitCode,
      orgUnitIdScheme,
      dataElementIdScheme,
      startDate,
      endDate,
      eventId,
      trackedEntityInstance,
      dataValueFormat,
    },
  ) => {
    if (dataSources.length > 1) {
      throw new Error('Cannot pull from multiple programs at the same time');
    }
    const [dataSource] = dataSources;
    const { code: programCode } = dataSource;

    const response = [];
    const pullForApi = async api => {
      const events = await api.getEvents({
        programCode,
        organisationUnitCode,
        orgUnitIdScheme,
        dataElementIdScheme,
        startDate,
        endDate,
        eventId,
        trackedEntityInstance,
        dataValueFormat,
      });

      response.push(...events);
    };

    await Promise.all(apis.map(pullForApi));
    return response;
  };
}
