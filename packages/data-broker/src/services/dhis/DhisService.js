/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getDhisApiInstance } from './getDhisApiInstance';

export class DhisService extends Service {
  constructor(...args) {
    super(...args);
    this.pushers = this.getPushers();
    this.deleters = this.getDeleters();
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

  get dataSourceTypes() {
    return this.models.DataSource.types;
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

  async push(dataSource, data) {
    const { isDataRegional } = dataSource;
    const { orgUnit: entityCode } = data;
    const api = getDhisApiInstance({ entityCode, isDataRegional });
    const pushData = this.pushers[dataSource.type];
    const diagnostics = await pushData(api, data, dataSource);
    return { diagnostics, serverName: api.getServerName() };
  }

  async pushAggregateData(api, dataValue, dataSource) {
    const translatedDataValue = await this.translateDataValueCode(dataValue, dataSource);
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
    const translatedDataValue = this.translateDataValueCode(dataValue, dataSource);
    return api.deleteDataValue(translatedDataValue);
  }

  deleteEvent = async (api, data) => api.deleteEvent(data.dhisReference);

  async pull(dataSource, metadata) {
    // TODO implement
  }
}
