/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import {
  getApiForValue,
  getApiFromServerName,
  getApisForDataSources,
  getApisForLegacyDataSourceConfig,
} from './getDhisApi';
import { DhisInstanceResolver } from './DhisInstanceResolver';
import { Service } from '../Service';
import { DhisTranslator } from './translators';
import {
  AnalyticsPuller,
  EventsPuller,
  DataElementsMetadataPuller,
  DeprecatedEventsPuller,
} from './pullers';

const DEFAULT_DATA_SERVICE = { isDataRegional: true };
const DEFAULT_DATA_SERVICES = [DEFAULT_DATA_SERVICE];

export class DhisService extends Service {
  constructor(models) {
    super(models);

    this.translator = new DhisTranslator(this.models);
    this.dhisInstanceResolver = new DhisInstanceResolver(models);
    this.dataElementsMetadataPuller = new DataElementsMetadataPuller(
      this.models.dataElement,
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
    };
  }

  async validatePushData(dataSources, dataValues) {
    const { serverName } = await getApiForValue(
      this.models,
      this.dhisInstanceResolver,
      dataSources[0],
      dataValues[0],
    );
    for (let i = 0; i < dataSources.length; i++) {
      const { serverName: otherServerName } = await getApiForValue(
        this.models,
        this.dhisInstanceResolver,
        dataSources[i],
        dataValues[i],
      );
      if (otherServerName !== serverName) {
        throw new Error(`All data being pushed must be for the same DHIS2 instance`);
      }
    }
  }

  async push(dataSources, data, { type }) {
    const pushData = this.pushers[type]; // all are of the same type
    const dataValues = Array.isArray(data) ? data : [data];
    await this.validatePushData(dataSources, dataValues);
    const api = await getApiForValue(
      this.models,
      this.dhisInstanceResolver,
      dataSources[0],
      dataValues[0],
    ); // all are for the same instance
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

  async delete(dataSource, data, { serverName, type } = {}) {
    let api;
    if (serverName) {
      api = await getApiFromServerName(this.models, serverName);
    } else {
      api = await getApiForValue(this.models, this.dhisInstanceResolver, dataSource, data);
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

  async pull(dataSources, type, options = {}) {
    const {
      organisationUnitCode,
      organisationUnitCodes,
      dataServices = DEFAULT_DATA_SERVICES,
      detectDataServices = false,
    } = options;

    const entityCodes = organisationUnitCodes || [organisationUnitCode];

    // TODO remove the `detectDataServices` flag after
    // https://linear.app/bes/issue/MEL-481/detect-data-services-in-the-data-broker-level
    const apis = detectDataServices
      ? await getApisForDataSources(
          this.models,
          this.dhisInstanceResolver,
          dataSources,
          entityCodes,
        )
      : await getApisForLegacyDataSourceConfig(
          this.models,
          this.dhisInstanceResolver,
          dataServices,
          entityCodes,
        );

    const { useDeprecatedApi = false } = options;
    const pullerKey = `${type}${useDeprecatedApi ? '_deprecated' : ''}`;

    const pullData = this.pullers[pullerKey];

    return pullData(apis, dataSources, options);
  }

  async pullMetadata(dataSources, type, options) {
    const { organisationUnitCode: entityCode, dataServices = DEFAULT_DATA_SERVICES } = options;
    const pullMetadata = this.metadataPullers[type];

    const apis = await getApisForLegacyDataSourceConfig(
      this.models,
      this.dhisInstanceResolver,
      dataServices,
      [entityCode],
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
