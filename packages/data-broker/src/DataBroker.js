/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { lower } from 'case';
import groupBy from 'lodash.groupby';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { countDistinct, toArray } from '@tupaia/utils';
import { createService } from './services';

let modelRegistry;

const getModelRegistry = () => {
  if (!modelRegistry) {
    modelRegistry = new ModelRegistry(new TupaiaDatabase());
  }
  return modelRegistry;
};

export class DataBroker {
  constructor(context = {}) {
    this.context = context;
    this.models = getModelRegistry();
    this.resultMergers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.mergeAnalytics,
      [this.getDataSourceTypes().DATA_GROUP]: this.mergeEvents,
      [this.getDataSourceTypes().SYNC_GROUP]: this.mergeSyncGroups,
    };
    this.fetchers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.fetchFromDataSourceTable,
      [this.getDataSourceTypes().DATA_GROUP]: this.fetchFromEventTable,
      [this.getDataSourceTypes().SYNC_GROUP]: this.fetchFromSyncGroupTable,
    };
  }

  async close() {
    return this.models.closeDatabaseConnections();
  }

  getDataSourceTypes() {
    return this.models.dataSource.getTypes();
  }

  fetchFromDataSourceTable = async dataSourceSpec => {
    return this.models.dataSource.find(dataSourceSpec);
  };

  fetchFromEventTable = async dataSourceSpec => {
    return this.models.event.find(dataSourceSpec);
  };

  fetchFromSyncGroupTable = async dataSourceSpec => {
    // Add 'type' field to output to keep object layout consistent between tables
    const syncGroups = await this.models.dataServiceSyncGroup.find({ code: dataSourceSpec.code });
    return syncGroups.map(sg => ({ ...sg, type: this.getDataSourceTypes().SYNC_GROUP }));
  };

  async fetchDataSources(dataSourceSpec) {
    const { code } = dataSourceSpec;
    const { type, ...restOfSpec } = dataSourceSpec;
    if (!code || (Array.isArray(code) && code.length === 0)) {
      throw new Error('Please provide at least one existing data source code');
    }
    const fetcher = this.fetchers[type];
    const dataSources = await fetcher(restOfSpec);
    const typeDescription = `${lower(type)}s`;
    if (dataSources.length === 0) {
      throw new Error(`None of the following ${typeDescription} exist: ${code}`);
    }

    const codesRequested = toArray(code);
    const codesFound = dataSources.map(ds => ds.code);
    const codesNotFound = codesRequested.filter(c => !codesFound.includes(c));
    if (codesNotFound.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(`Could not find the following ${typeDescription}: ${codesNotFound}`);
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
    return service.push(dataSources, data, { type: dataSourceSpec.type });
  }

  async delete(dataSourceSpec, data, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const [dataSource] = dataSources;
    const service = this.createService(dataSource.service_type);
    return service.delete(dataSource, data, { type: dataSourceSpec.type, ...options });
  }

  async pull(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const { type } = dataSourceSpec;

    const dataSourcesByService = groupBy(dataSources, 'service_type');
    const dataSourceFetches = Object.values(dataSourcesByService);
    const nestedResults = await Promise.all(
      dataSourceFetches.map(dataSourceForFetch =>
        this.pullForServiceAndType(dataSourceForFetch, options, type),
      ),
    );
    const mergeResults = this.resultMergers[type];

    return nestedResults.reduce(
      (results, resultsForService) => mergeResults(results, resultsForService),
      undefined,
    );
  }

  pullForServiceAndType = async (dataSources, options, type) => {
    const { service_type: serviceType } = dataSources[0];
    const service = this.createService(serviceType);
    return service.pull(dataSources, type, options);
  };

  mergeAnalytics = (target = { results: [], metadata: {} }, source) => {
    const sourceNumAggregationsProcessed = source.numAggregationsProcessed || 0;
    const targetResults = target.results;

    // Result analytics can be combined if they've processed aggregations to the same level
    const matchingResultIndex = targetResults.findIndex(
      ({ numAggregationsProcessed }) => numAggregationsProcessed === sourceNumAggregationsProcessed,
    );

    let newResults;
    if (matchingResultIndex >= 0) {
      // Found a matching result, combine the matching result analytics and the new analytics
      const matchingResult = targetResults[matchingResultIndex];
      newResults = targetResults
        .slice(0, matchingResultIndex)
        .concat([
          {
            ...matchingResult,
            analytics: matchingResult.analytics.concat(source.results),
          },
        ])
        .concat(targetResults.slice(matchingResultIndex + 1, targetResults.length - 1));
    } else {
      // No matching result, just append this result to previous results
      newResults = targetResults.concat([
        { analytics: source.results, numAggregationsProcessed: sourceNumAggregationsProcessed },
      ]);
    }

    return {
      results: newResults,
      metadata: {
        dataElementCodeToName: {
          ...target.metadata.dataElementCodeToName,
          ...source.metadata.dataElementCodeToName,
        },
      },
    };
  };

  mergeEvents = (target = [], source) => target.concat(source);

  mergeSyncGroups = (target = [], source) => target.concat(source);

  async pullMetadata(dataSourceSpec, options) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    if (countDistinct(dataSources, 'service_type') > 1) {
      throw new Error('Cannot pull metadata for data sources belonging to different services');
    }
    const service = this.createService(dataSources[0].service_type);
    // `dataSourceSpec` is defined  for a single `type`
    const { type } = dataSourceSpec;
    return service.pullMetadata(dataSources, type, options);
  }
}
