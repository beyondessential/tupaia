/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createService } from './services';
import { getModels } from './getModels';

export class DataBroker {
  constructor() {
    this.models = getModels();
  }

  getDataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  async fetchDataSource(dataSourceSpec) {
    return this.models.dataSource.findOneOrDefault(dataSourceSpec);
  }

  async fetchDataSources(dataSourceSpec) {
    return this.models.dataSource.findOrDefault(dataSourceSpec);
  }

  createService(serviceType) {
    return createService(this.models, serviceType);
  }

  async push(dataSourceSpec, data) {
    const dataSource = await this.fetchDataSource(dataSourceSpec);
    const service = this.createService(dataSource.service_type);
    return service.push(dataSource, data);
  }

  async delete(dataSourceSpec, data, options) {
    const dataSource = await this.fetchDataSource(dataSourceSpec);
    const service = this.createService(dataSource.service_type);
    return service.delete(dataSource, data, options);
  }

  async fetchDataSourcesForPull(dataSourceSpec) {
    const errorMessage = 'Please provide at least one existing data source code';

    const { code } = dataSourceSpec;
    if (!code || (Array.isArray(code) && code.length === 0)) {
      throw new Error(errorMessage);
    }
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    if (dataSources.length === 0) {
      throw new Error(errorMessage);
    }

    return dataSources;
  }

  async pull(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSourcesForPull(dataSourceSpec);

    // `dataSourceSpec` is defined for a single `type` and `service_type`
    // This way we avoid merging responses with incompatible data structures.
    // It also means all fetched `dataSources` will have the same types
    const { type, service_type: serviceType } = dataSources[0];
    const service = this.createService(serviceType);
    return service.pull(dataSources, type, options);
  }

  async pullMetadata(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSourcesForPull(dataSourceSpec);
    // `dataSourceSpec` is defined  for a single `type` and `service_type`
    const { type, service_type: serviceType } = dataSources[0];
    const service = this.createService(serviceType);

    return service.pullMetadata(dataSources, type, options);
  }
}
