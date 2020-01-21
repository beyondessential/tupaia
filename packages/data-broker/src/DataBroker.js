/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getServiceFromDataSource } from './services';
import { getModels } from './getModels';

export class DataBroker {
  constructor() {
    this.models = getModels();
  }

  async getService(code, type) {
    const dataSource = await this.models.dataSource.fetchFromDbOrDefault(code, type);
    return getServiceFromDataSource(dataSource, this.models);
  }

  async push(code, data, type) {
    const service = await this.getService(code, type);
    return service.push(data);
  }

  async pull(code, metadata, type) {
    const service = await this.getService(code, type);
    return service.pull(metadata);
  }
}
