/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DataSource } from '@tupaia/database';

import { getServiceFromDataSource } from './services';
import { getModels } from './getModels';

export class DataBroker {
  constructor() {
    this.models = getModels();
  }

  async getService(type, code) {
    const dataSource = await this.models.dataSource.fetchFromDbOrDefault(type, code);
    return getServiceFromDataSource(dataSource);
  }

  async push(type, code, data) {
    const service = await this.getService(code, type);
    return service.push(data);
  }

  async pushAggregateDataValue(dataValue) {
    return this.push(DataSource.types.question, dataValue.code, dataValue);
  }

  async pushEvent(event) {
    return this.push(DataSource.types.survey, event.program, event);
  }

  async pull(code, metadata) {
    const service = await this.getService(DataSource.types.question, code);
    return service.pull(metadata);
  }
}
