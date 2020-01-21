/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataSource } from '@tupaia/database';
import { Service } from '../Service';
import { getServerName, getDhisApiInstance } from './getDhisApiInstance';

export class DhisService extends Service {
  getApi(entityCode) {
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
  async translateDataValue(dataSource, isAggregate = true) {
    const dataElementCode = dataSource.config.dataElementCode || dataSource.code;
    if (isAggregate) return { dataElement: dataElementCode };
    const dataElementId = await this.getDataElementId(dataElementCode);
    return { dataElement: dataElementId };
  }

  async push(data) {
    switch (this.dataSource.type) {
      default:
      case DataSource.types.question:
        return this.pushAggregateData(data);
      case DataSource.types.survey:
        return this.pushEvent(data);
    }
  }

  async pushAggregateData({ code, ...restOfDataValue }) {
    const dataValue = {
      dataElement: await this.translateDataElementIdentifier(this.dataSource),
      ...restOfDataValue,
    };
    return this.api.postDataValueSets([dataValue]);
  }

  async pushEvent({ dataValues, ...restOfEvent }) {
    const translatedDataValues = await Promise.all(
      dataValues.map(async ({ code, ...restOfValue }) => {
        const dataSource = await this.models.dataSource.fetchFromDbOrDefault(code);
        return {
          dataElement: await this.translateDataElementIdentifier(dataSource, false),
          ...restOfValue,
        };
      }),
    );
    return this.api.postEvents([{ dataValues: translatedDataValues, ...restOfEvent }]);
  }

  async pull(metadata) {
    const api = this.getApi(metadata.entityCode);
    // TODO implement
  }
}
