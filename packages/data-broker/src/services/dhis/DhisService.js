/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { modelClasses } from '@tupaia/database';
import { Service } from '../Service';
import { getServerName, getDhisApiInstance } from './getDhisApiInstance';
const { dataSource: DataSource } = modelClasses;

export class DhisService extends Service {
  pushers = {
    [DataSource.types.question]: this.pushAggregateData,
    [DataSource.types.survey]: this.pushEvent,
  };

  deleters = {
    [DataSource.types.question]: this.deleteAggregateData,
    [DataSource.types.survey]: (api, data) => api.deleteEvent(data.dhisReference),
  };

  getApiForEntity(entityCode) {
    const serverName = getServerName(entityCode, this.dataSource.config.isDataRegional);
    return getDhisApiInstance({ serverName });
  }

  async getDataElementId(code) {
    // Using "id" id scheme, need to fetch the DHIS2 internal id
    const dataElementId = await this.api.getIdFromCode(this.api.resourceTypes.DATA_ELEMENT, code);
    if (!dataElementId) {
      throw new Error(`No data element with code ${code}`);
    }
    return dataElementId;
  }

  /**
   *
   * @param {DataSource} dataSource   Note that this may not be the instance's primary data source
   * @param {boolean}    isAggregate  Whether this translation is for an aggregate data value
   */
  async translateDataElementIdentifier(dataSource, isAggregate = true) {
    const dataElementCode = dataSource.config.dataElementCode || dataSource.code;
    return isAggregate ? dataElementCode : this.getDataElementId(dataElementCode);
  }

  async push(data) {
    const api = this.getApiForEntity(data.orgUnit);
    const pushData = this.pushers[this.dataSource.type];
    const diagnostics = await pushData(api, data);
    return { diagnostics, serverName: api.getServerName() };
  }

  async pushAggregateData(api, { code, ...restOfDataValue }) {
    const dataValue = {
      dataElement: await this.translateDataElementIdentifier(api, this.dataSource),
      ...restOfDataValue,
    };
    return api.postDataValueSets([dataValue]);
  }

  async pushEvent(api, { dataValues, ...restOfEvent }) {
    const translatedDataValues = await Promise.all(
      dataValues.map(async ({ code, ...restOfValue }) => {
        const dataSource = await this.models.dataSource.fetchFromDbOrDefault(code);
        return {
          dataElement: await this.translateDataElementIdentifier(api, dataSource, false),
          ...restOfValue,
        };
      }),
    );
    const event = { dataValues: translatedDataValues, ...restOfEvent };
    return api.postEvents([event]);
  }

  async delete(data, { serverName }) {
    const api = getDhisApiInstance({ serverName });
    const deleteData = this.deleters[this.dataSource.type];
    return deleteData(api, data);
  }

  async deleteAggregateData(api, { code, ...restOfDataValue }) {
    const dataValue = {
      dataElement: await this.translateDataElementIdentifier(api, this.dataSource),
      ...restOfDataValue,
    };
    return api.deleteDataValue(dataValue);
  }

  async pull(metadata) {
    const api = this.getApiForEntity(metadata.entityCode);
    // TODO implement
  }
}
