/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';

export class DhisService extends Service {
  constructor(...args) {
    super(...args);
    this.pushers = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.pushAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.pushEvent.bind(this),
    };

    this.deleters = {
      [this.dataSourceTypes.DATA_ELEMENT]: this.deleteAggregateData.bind(this),
      [this.dataSourceTypes.DATA_GROUP]: this.deleteEvent.bind(this),
    };
  }

  get dataSourceTypes() {
    return this.models.DataSource.types;
  }

  getApiForEntity(entityCode) {
    const { isDataRegional } = this.dataSource.config;
    return getDhisApiInstance({ entityCode, isDataRegional });
  }

  /**
   *
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSource} dataSource   Note that this may not be the instance's primary data source
   */
  translateDataValueCode = ({ code, ...restOfDataValue }, dataSource) => ({
    dataElement: dataSource.config.dataElementCode || dataSource.code,
    ...restOfDataValue,
  });

  async translateEventDataValues(api, dataValues) {
    const dataSources = await this.models.DataSource.findOrDefault({
      code: dataValues.map(({ code }) => code),
      type: this.dataSourceTypes.DATA_ELEMENT,
    });
    const dataValuesWithCodeReplaced = dataValues.map((d, i) =>
      this.translateDataValueCode(d, dataSources[i]),
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

  async push(data) {
    const api = this.getApiForEntity(data.orgUnit);
    const pushData = this.pushers[this.dataSource.type];
    const diagnostics = await pushData(api, data);
    return { diagnostics, serverName: api.getServerName() };
  }

  async pushAggregateData(api, dataValue) {
    const translatedDataValue = await this.translateDataValueCode(dataValue, this.dataSource);
    return api.postDataValueSets([translatedDataValue]);
  }

  async pushEvent(api, { dataValues, ...restOfEvent }) {
    const translatedDataValues = await this.translateEventDataValues(api, dataValues);
    const event = { dataValues: translatedDataValues, ...restOfEvent };
    return api.postEvents([event]);
  }

  async delete(data, { serverName }) {
    const api = getDhisApiInstance({ serverName });
    const deleteData = this.deleters[this.dataSource.type];
    return deleteData(api, data);
  }

  async deleteAggregateData(api, dataValue) {
    const translatedDataValue = this.translateDataValueCode(dataValue, this.dataSource);
    return api.deleteDataValue(translatedDataValue);
  }

  deleteEvent = async (api, data) => api.deleteEvent(data.dhisReference);

  async pull(metadata) {
    const api = this.getApiForEntity(metadata.entityCode);
    // TODO implement
  }
}
