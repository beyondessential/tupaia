/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { Service } from '../Service';
import { getServerName, getDhisApiInstance } from './getDhisApiInstance';

export class DhisService extends Service {
  constructor(...args) {
    super(...args);
    this.pushers = {
      [this.models.DataSource.types.DATA_ELEMENT]: this.pushAggregateData.bind(this),
      [this.models.DataSource.types.DATA_GROUP]: this.pushEvent.bind(this),
    };

    this.deleters = {
      [this.models.DataSource.types.DATA_ELEMENT]: this.deleteAggregateData.bind(this),
      [this.models.DataSource.types.DATA_GROUP]: this.deleteEvent.bind(this),
    };
  }

  getApiForEntity(entityCode) {
    const serverName = getServerName(entityCode, this.dataSource.config.isDataRegional);
    return getDhisApiInstance({ serverName });
  }

  /**
   * Translates the data element metadata using the config in dataSource
   * @param {Object}     dataValue    The untranslated data value
   * @param {DataSource} dataSource   Note that this may not be the instance's primary data source
   */
  translateDataValueCode = async (api, { code, ...restOfDataValue }, { config }) => {
    const { dataElementCode, categoryOptionComboCode } = config;
    const translatedDataValue = {
      dataElement: dataElementCode || code, // if no alternative mapping is specified, use its code
      ...restOfDataValue,
    };
    if (categoryOptionComboCode) {
      translatedDataValue.categoryOptionCombo = await api.getIdFromCode(
        api.getResourceTypes().CATEGORY_OPTION_COMBO,
        categoryOptionComboCode,
      );
    }
    return translatedDataValue;
  };

  async translateEventDataValues(api, dataValues) {
    const dataSources = await this.models.DataSource.fetchManyFromDbOrDefault(
      dataValues.map(({ code }) => ({ code })),
    );
    const dataValuesWithCodeReplaced = await Promise.all(
      dataValues.map(async (d, i) => this.translateDataValueCode(d, dataSources[i])),
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
    const translatedDataValue = await this.translateDataValueCode(dataValue, this.dataSource);
    return api.deleteDataValue(translatedDataValue);
  }

  deleteEvent = async (api, data) => api.deleteEvent(data.dhisReference);

  async pull(metadata) {
    const api = this.getApiForEntity(metadata.entityCode);
    // TODO implement
  }
}
