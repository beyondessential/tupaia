/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import {
  getApiForDataSource,
  getApiFromServerName,
  getApisForDataSources,
  getApisForLegacyDataSourceConfig,
} from './getDhisApi';
import { Service } from '../Service';
import { DhisTranslator } from './translators';
import {
  AnalyticsPuller,
  EventsPuller,
  DataElementsMetadataPuller,
  DataGroupMetadataPuller,
  DeprecatedEventsPuller,
} from './pullers';

const DEFAULT_DATA_SERVICE = { isDataRegional: true };
const DEFAULT_DATA_SERVICES = [DEFAULT_DATA_SERVICE];

export class DhisService extends Service {
  constructor(models) {
    super(models);

    this.translator = new DhisTranslator(this.models);
    this.dataElementsMetadataPuller = new DataElementsMetadataPuller(
      this.models.dataElement,
      this.translator,
    );
    this.dataGroupMetadataPuller = new DataGroupMetadataPuller(
      this.models.dataGroup,
      this.translator,
    );
    this.analyticsPuller = new AnalyticsPuller(
      this.models,
      this.translator,
      this.dataElementsMetadataPuller,
    );
    this.eventsPuller = new EventsPuller(this.models, this.translator);
    this.deprecatedEventsPuller = new DeprecatedEventsPuller(
      this.models.dataElement,
      this.translator,
    );
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
    this.pullers = this.getPullers();
    this.metadataPullers = this.getMetadataPullers();
    this.metadataMergers = this.getMetadataMergers();
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
      [`${this.dataSourceTypes.DATA_GROUP}_deprecated`]: this.deprecatedEventsPuller.pull.bind(
        this,
      ),
    };
  }

  getMetadataPullers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: this.dataElementsMetadataPuller.pull.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.dataGroupMetadataPuller.pull.bind(this),
    };
  }

  getMetadataMergers() {
    return {
      [this.dataSourceTypes.DATA_ELEMENT]: results =>
        results.reduce((existingResults, result) => existingResults.concat(result)),
      [this.dataSourceTypes.DATA_GROUP]: results => results[0],
    };
  }

  async validatePushData(dataSources, dataValues, dataServiceMapping) {
    const { serverName } = await getApiForDataSource(
      this.models,
      dataSources[0],
      dataServiceMapping,
    );
    for (let i = 0; i < dataSources.length; i++) {
      const { serverName: otherServerName } = await getApiForDataSource(
        this.models,
        dataSources[i],
        dataServiceMapping,
      );
      if (otherServerName !== serverName) {
        throw new Error(`All data being pushed must be for the same DHIS2 instance`);
      }
    }
  }

  async push(dataSources, data, { type, dataServiceMapping }) {
    const pushData = this.pushers[type]; // all are of the same type
    const dataValues = Array.isArray(data) ? data : [data];
    await this.validatePushData(dataSources, dataValues, dataServiceMapping);
    const api = await getApiForDataSource(this.models, dataSources[0], dataServiceMapping); // all are for the same instance
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

  async delete(dataSource, data, { serverName, type, dataServiceMapping } = {}) {
    let api;
    if (serverName) {
      api = await getApiFromServerName(this.models, serverName);
    } else {
      api = await getApiForDataSource(this.models, dataSource, dataServiceMapping);
    }
    const deleteData = this.deleters[type];
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

  async getPullApis(
    dataSources,
    entityCodes,
    detectDataServices,
    dataServices,
    dataServiceMapping,
  ) {
    const apis = detectDataServices
      ? await getApisForDataSources(this.models, dataSources, dataServiceMapping)
      : await getApisForLegacyDataSourceConfig(this.models, dataServices);

    return apis;
  }

  async pull(dataSources, type, options = {}) {
    const {
      organisationUnitCode,
      organisationUnitCodes,
      dataServices = DEFAULT_DATA_SERVICES,
      detectDataServices = false,
      dataServiceMapping,
    } = options;

    const entityCodes = organisationUnitCodes || [organisationUnitCode];

    // TODO remove the `detectDataServices` flag after
    // https://linear.app/bes/issue/MEL-481/detect-data-services-in-the-data-broker-level

    const apis = await this.getPullApis(
      dataSources,
      entityCodes,
      detectDataServices,
      dataServices,
      dataServiceMapping,
    );

    const { useDeprecatedApi = false } = options;
    const pullerKey = `${type}${useDeprecatedApi ? '_deprecated' : ''}`;

    const pullData = this.pullers[pullerKey];
    return pullData(apis, dataSources, options);
  }

  async pullMetadata(dataSources, type, options) {
    const {
      organisationUnitCode,
      organisationUnitCodes,
      dataServices = DEFAULT_DATA_SERVICES,
      detectDataServices = false,
      dataServiceMapping,
    } = options;

    const puller = this.metadataPullers[type];
    const entityCodes = organisationUnitCodes || [organisationUnitCode];
    const apis = await this.getPullApis(
      dataSources,
      entityCodes,
      detectDataServices,
      dataServices,
      dataServiceMapping,
    );

    const results = [];
    const pullForApi = async api => {
      const newResults = await puller(api, dataSources, options);
      results.push(newResults);
    };
    await Promise.all(apis.map(pullForApi));

    const mergeMetadata = this.metadataMergers[type];
    return mergeMetadata(results);
  }
}
