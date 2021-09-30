/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';
import { DhisTranslator } from './DhisTranslator';
import { AnalyticsPuller, EventsPuller, DataElementsMetadataPuller } from './pullers';

const DEFAULT_DATA_SERVICE = { isDataRegional: true };
const DEFAULT_DATA_SERVICES = [DEFAULT_DATA_SERVICE];

export class DhisService extends Service {
  constructor(models) {
    super(models);

    this.translator = new DhisTranslator(this.models);
    this.dataElementsMetadataPuller = new DataElementsMetadataPuller(
      this.models.dataSource,
      this.translator,
    );
    this.analyticsPuller = new AnalyticsPuller(
      this.models.dataSource,
      this.translator,
      this.dataElementsMetadataPuller,
    );
    this.eventsPuller = new EventsPuller(this.models.dataSource, this.translator);
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
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
      [this.dataSourceTypes.DATA_ELEMENT]: this.analyticsPuller.pull.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.eventsPuller.pull.bind(this),
    };
  }

  getMetadataPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.dataElementsMetadataPuller.pull.bind(this),
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
      dataServices: inputDataServices = DEFAULT_DATA_SERVICES,
      detectDataServices = false,
    } = options;
    let dataServices = inputDataServices;
    // TODO remove the `detectDataServices` flag after
    // https://linear.app/bes/issue/MEL-481/detect-data-services-in-the-data-broker-level
    if (detectDataServices) {
      dataServices = dataSources.map(ds => {
        const { isDataRegional = true } = ds.config;
        return { isDataRegional };
      });
    }

    const entityCodes = organisationUnitCodes || [organisationUnitCode];
    const pullData = this.pullers[type];

    const apis = new Set();
    dataServices.forEach(({ isDataRegional }) => {
      apis.add(getDhisApiInstance({ entityCodes, isDataRegional }, this.models));
    });

    return pullData(Array.from(apis), dataSources, options);
  }

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
}
