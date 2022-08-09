/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

/* eslint-disable react/static-property-placement */

import { lower } from 'case';
import groupBy from 'lodash.groupby';

import type { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { countDistinct, toArray } from '@tupaia/utils';
import { createService } from './services';
import {
  Analytic,
  AnalyticResults as RawAnalyticResults,
  DataBrokerModelRegistry,
  DataElement,
  DataSource,
  DataSourceType,
  EventResults,
  ServiceType,
  SyncGroupResults,
} from './types';
import { DATA_SOURCE_TYPES, EMPTY_ANALYTICS_RESULTS } from './utils';

export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

type Context = {
  accessPolicy?: AccessPolicy;
};

export interface DataSourceSpec<T extends DataSourceType = DataSourceType> {
  code: string | string[];
  type: T;
}

type FetchConditions = { code: string | string[] };

interface AnalyticResults {
  results: {
    analytics: Analytic[];
    numAggregationsProcessed: number;
  }[];
  metadata: {
    dataElementCodeToName: Record<string, string>;
  };
}

type Merger<T, S = T> = (target: T | undefined, source: S) => T;

type ResultMerger =
  | Merger<AnalyticResults, RawAnalyticResults>
  | Merger<EventResults>
  | Merger<SyncGroupResults>;

type Fetcher = (dataSourceSpec: FetchConditions) => Promise<DataSource[]>;

type PermissionChecker = ((dataSources: DataSource[]) => Promise<boolean>) | (() => boolean);

let modelRegistry: DataBrokerModelRegistry;

const getModelRegistry = () => {
  if (!modelRegistry) {
    modelRegistry = new ModelRegistry(new TupaiaDatabase()) as DataBrokerModelRegistry;
  }
  return modelRegistry;
};

const getPermissionListWithWildcard = async (accessPolicy?: AccessPolicy) => {
  // Get the users permission groups as a list of codes
  if (!accessPolicy) {
    return ['*'];
  }
  const userPermissionGroups = accessPolicy.getPermissionGroups();
  return ['*', ...userPermissionGroups];
};

export class DataBroker {
  public readonly context: Context;

  private readonly models: DataBrokerModelRegistry;
  private readonly resultMergers: Record<DataSourceType, ResultMerger>;
  private readonly fetchers: Record<DataSourceType, Fetcher>;
  private readonly permissionCheckers: Record<DataSourceType, PermissionChecker>;
  private userPermissions: string[] | undefined;

  public constructor(context = {}) {
    this.context = context;
    this.models = getModelRegistry();
    this.resultMergers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.mergeAnalytics,
      [this.getDataSourceTypes().DATA_GROUP]: this.mergeEvents,
      [this.getDataSourceTypes().SYNC_GROUP]: this.mergeSyncGroups,
    };
    this.fetchers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.fetchFromDataElementTable,
      [this.getDataSourceTypes().DATA_GROUP]: this.fetchFromDataGroupTable,
      [this.getDataSourceTypes().SYNC_GROUP]: this.fetchFromSyncGroupTable,
    };
    // Run permission checks in data broker so we only expose data the user is allowed to see
    // It's a good centralised place for it
    this.permissionCheckers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.checkDataElementPermissions,
      [this.getDataSourceTypes().DATA_GROUP]: this.checkDataGroupPermissions,
      [this.getDataSourceTypes().SYNC_GROUP]: this.checkSyncGroupPermissions,
    };
  }

  private async getUserPermissions() {
    if (!this.userPermissions) {
      this.userPermissions = await getPermissionListWithWildcard(this.context.accessPolicy);
    }
    return this.userPermissions;
  }

  public async close() {
    return this.models.closeDatabaseConnections();
  }

  public getDataSourceTypes() {
    return DATA_SOURCE_TYPES as {
      DATA_ELEMENT: 'dataElement';
      DATA_GROUP: 'dataGroup';
      SYNC_GROUP: 'syncGroup';
    };
  }

  private fetchFromDataElementTable = async (dataSourceSpec: FetchConditions) => {
    return this.models.dataElement.find(dataSourceSpec);
  };

  private fetchFromDataGroupTable = async (dataSourceSpec: FetchConditions) => {
    return this.models.dataGroup.find(dataSourceSpec);
  };

  private fetchFromSyncGroupTable = async (
    dataSourceSpec: FetchConditions,
  ): Promise<DataSource[]> => {
    // Add 'type' field to output to keep object layout consistent between tables
    const syncGroups = await this.models.dataServiceSyncGroup.find({ code: dataSourceSpec.code });
    return syncGroups.map(sg => ({ ...sg, type: this.getDataSourceTypes().SYNC_GROUP }));
  };

  private checkDataElementPermissions = async (dataElements: DataSource[]) => {
    const userPermissions = await this.getUserPermissions();
    if (userPermissions.includes(BES_ADMIN_PERMISSION_GROUP)) {
      return true;
    }
    const missingPermissions = [];
    for (const element of dataElements as DataElement[]) {
      if (
        element.permission_groups.length <= 0 ||
        element.permission_groups.some(code => userPermissions.includes(code))
      ) {
        continue;
      }
      missingPermissions.push(element.code);
    }
    if (missingPermissions.length === 0) {
      return true;
    }
    throw new Error(`Missing permissions to the following data elements: ${missingPermissions}`);
  };

  private checkDataGroupPermissions = async (dataGroups: DataSource[]) => {
    const missingPermissions = [];
    for (const group of dataGroups) {
      const dataElements = await this.models.dataGroup.getDataElementsInDataGroup(group.code);
      try {
        await this.checkDataElementPermissions(dataElements);
      } catch {
        missingPermissions.push(group.code);
      }
    }
    if (missingPermissions.length === 0) {
      return true;
    }
    throw new Error(`Missing permissions to the following data groups: ${missingPermissions}`);
  };

  // No check for syncGroups currently
  private checkSyncGroupPermissions = () => {
    return true;
  };

  private async fetchDataSources(dataSourceSpec: DataSourceSpec) {
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

  private createService(serviceType: ServiceType) {
    return createService(this.models, serviceType, this);
  }

  public async push(dataSourceSpec: DataSourceSpec, data: unknown) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    if (countDistinct(dataSources, 'service_type') > 1) {
      throw new Error('Cannot push data belonging to different services');
    }
    const service = this.createService(dataSources[0].service_type);
    return service.push(dataSources, data, { type: dataSourceSpec.type });
  }

  public async delete(
    dataSourceSpec: DataSourceSpec,
    data: unknown,
    options: Record<string, unknown>,
  ) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const [dataSource] = dataSources;
    const service = this.createService(dataSource.service_type);
    return service.delete(dataSource, data, { type: dataSourceSpec.type, ...options });
  }

  public async pull(
    dataSourceSpec: DataSourceSpec<'dataElement'>,
    options: Record<string, unknown>,
  ): Promise<RawAnalyticResults>;
  public async pull(
    dataSourceSpec: DataSourceSpec<'dataGroup'>,
    options: Record<string, unknown>,
  ): Promise<EventResults>;
  public async pull(
    dataSourceSpec: DataSourceSpec<'syncGroup'>,
    options: Record<string, unknown>,
  ): Promise<SyncGroupResults>;
  public async pull(dataSourceSpec: DataSourceSpec, options: Record<string, unknown>) {
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
      // @ts-expect-error Current implementation is too dynamic to fit into elegant TS types
      (results, resultsForService) => mergeResults(results, resultsForService),
      undefined,
    );
  }

  private pullForServiceAndType = async (
    dataSources: DataSource[],
    options: Record<string, unknown>,
    type: DataSourceType,
  ) => {
    const { service_type: serviceType } = dataSources[0];
    const permissionChecker = this.permissionCheckers[type];
    // Permission checkers will throw if they fail
    await permissionChecker(dataSources);
    const service = this.createService(serviceType);
    return service.pull(dataSources, type, options);
  };

  private mergeAnalytics = (
    target: AnalyticResults = EMPTY_ANALYTICS_RESULTS,
    source: RawAnalyticResults,
  ) => {
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

  private mergeEvents = (target: EventResults = [], source: EventResults) => target.concat(source);

  private mergeSyncGroups = (target: SyncGroupResults = {}, source: SyncGroupResults) => ({
    ...target,
    ...source,
  });

  public async pullMetadata(dataSourceSpec: DataSourceSpec, options?: Record<string, unknown>) {
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
