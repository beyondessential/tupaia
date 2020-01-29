/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { modelClasses } from '@tupaia/database';
import { createService } from './services';
import { getModels } from './getModels';

/**
 * Defines which data source should be selected from the `data_source` table
 *
 * @typedef {Object} DataSourceSpec
 * @property {string} code  Matches on the code column
 * @property {string} type  Matches on the type column
 */

export class DataBroker {
  constructor() {
    this.models = getModels();
  }

  getDataSourceTypes() {
    return modelClasses.DataSource.types;
  }

  fetchDataSource(spec) {
    return this.models.dataSource.findOneOrDefault(spec);
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

  async pull(dataSourceSpec, metadata) {
    const dataSource = await this.fetchDataSource(dataSourceSpec);
    const service = this.createService(dataSource.service_type);
    return service.pull(dataSource, metadata);
  }
}
