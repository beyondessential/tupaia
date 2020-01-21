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

  async getService(dataSourceSpec) {
    const dataSource = await this.models.dataSource.fetchFromDbOrDefault(dataSourceSpec);
    return getServiceFromDataSource(dataSource, this.models);
  }

  async push(dataSourceSpec, data) {
    const service = await this.getService(dataSourceSpec);
    return service.push(data);
  }

  async pull(dataSourceSpec, metadata) {
    const service = await this.getService(dataSourceSpec);
    return service.pull(metadata);
  }
}
