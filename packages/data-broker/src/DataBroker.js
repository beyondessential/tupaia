/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createService } from './services';
import { getModels } from './getModels';
import { getSpoofData, validCodeConfig } from './laosSchoolsSpoofData';

export class DataBroker {
  constructor() {
    this.models = getModels();
  }

  close() {
    this.models.closeDatabaseConnections();
  }

  getDataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  async fetchDataSources(dataSourceSpec) {
    const errorMessage = 'Please provide at least one existing data source code';

    const { code } = dataSourceSpec;
    if (!code || (Array.isArray(code) && code.length === 0)) {
      throw new Error(errorMessage);
    }
    const dataSources = await this.models.dataSource.findOrDefault(dataSourceSpec);
    if (dataSources.length === 0) {
      throw new Error(errorMessage);
    }

    return dataSources;
  }

  createService(dataSources) {
    // `dataSourceSpec` is defined for a single `service_type`
    const { service_type: serviceType } = dataSources[0];
    return createService(this.models, serviceType);
  }

  async push(dataSourceSpec, data) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const service = this.createService(dataSources);
    return service.push(dataSources, data);
  }

  async delete(dataSourceSpec, data, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const service = this.createService(dataSources);
    const [dataSource] = dataSources;
    return service.delete(dataSource, data, options);
  }

  async pull(dataSourceSpec, options) {
    // Not sure what codes are asked for here. If it is not school level we need some different logic
    // For overlays it is probably country
    if (dataSourceSpec && dataSourceSpec.code && validCodeConfig[dataSourceSpec.code[0]]) {
      return getSpoofData(dataSourceSpec, options);
    }
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const service = this.createService(dataSources);

    // `dataSourceSpec` is defined for a single `type`
    const { type } = dataSources[0];
    return service.pull(dataSources, type, options);
  }

  async pullMetadata(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const service = this.createService(dataSources);

    // `dataSourceSpec` is defined  for a single `type`
    const { type } = dataSources[0];
    return service.pullMetadata(dataSources, type, options);
  }
}
