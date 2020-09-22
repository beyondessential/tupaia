/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import groupBy from 'lodash.groupby';

import { countDistinct } from '@tupaia/utils';
import { createService } from './services';
import { getModels } from './getModels';

export class DataBroker {
  constructor() {
    this.models = getModels();
    this.resultMergers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.mergeAnalytics,
      [this.getDataSourceTypes().DATA_GROUP]: this.mergeEvents,
    };
  }

  async close() {
    return this.models.closeDatabaseConnections();
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

  createService(serviceType) {
    return createService(this.models, serviceType, this);
  }

  async push(dataSourceSpec, data) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    if (countDistinct(dataSources, 'service_type') > 1) {
      throw new Error('Cannot push data belonging to different services');
    }
    const service = this.createService(dataSources[0].service_type);
    return service.push(dataSources, data);
  }

  async delete(dataSourceSpec, data, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const [dataSource] = dataSources;
    const service = this.createService(dataSource.service_type);
    return service.delete(dataSource, data, options);
  }

  async pull(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    if (countDistinct(dataSources, 'type') > 1) {
      throw new Error('Cannot pull multiple types of data in one call');
    }

    const dataSourcesByService = groupBy(dataSources, 'service_type');
    const nestedResults = await Promise.all(
      Object.values(dataSourcesByService).map(dataSourcesForService =>
        this.pullForServiceAndType(dataSourcesForService, options),
      ),
    );
    const mergeResults = this.resultMergers[dataSources[0].type];

    return nestedResults.reduce((results, resultsForService) =>
      mergeResults(results, resultsForService),
    );
  }

  pullForServiceAndType = async (dataSources, options) => {
    const { type, service_type: serviceType } = dataSources[0];
    const service = this.createService(serviceType);
    return service.pull(dataSources, type, options);
  };

  mergeAnalytics = (target = { results: [], metadata: {} }, source) => ({
    results: target.results.concat(source.results),
    metadata: {
      dataElementCodeToName: {
        ...target.metadata.dataElementCodeToName,
        ...source.metadata.dataElementCodeToName,
      },
    },
  });

  mergeEvents = (target = [], source) => target.concat(source);

  async pullMetadata(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    if (countDistinct(dataSources, 'service_type') > 1) {
      throw new Error('Cannot pull metadata for data sources belonging to different services');
    }
    const service = this.createService(dataSources[0].service_type);
    // `dataSourceSpec` is defined  for a single `type`
    const { type } = dataSources[0];
    return service.pullMetadata(dataSources, type, options);
  }
}
