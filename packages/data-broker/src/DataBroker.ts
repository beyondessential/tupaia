/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { lower } from 'case';

import type { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { toArray } from '@tupaia/utils';
import { isNotNullish } from '@tupaia/tsutils';
import { createService } from './services';
import { DataServiceResolver } from './services/DataServiceResolver';
import {
  Analytic,
  AnalyticResults as RawAnalyticResults,
  DataBrokerModelRegistry,
  DataSource,
  DataSourceTypeInstance,
  DataSourceType,
  EventResults,
  ServiceType,
  SyncGroupResults,
  DataElement,
} from './types';
import { DATA_SOURCE_TYPES, EMPTY_ANALYTICS_RESULTS } from './utils';
import { DataServiceMapping } from './services/DataServiceMapping';

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

type Fetcher = (dataSourceSpec: FetchConditions) => Promise<DataSourceTypeInstance[]>;

type PermissionChecker =
  | ((dataSources: DataSource[], countryCodes: string[] | null) => Promise<boolean>)
  | (() => boolean);

let modelRegistry: DataBrokerModelRegistry;

const getModelRegistry = () => {
  if (!modelRegistry) {
    modelRegistry = new ModelRegistry(new TupaiaDatabase()) as DataBrokerModelRegistry;
  }
  return modelRegistry;
};

const getPermissionListWithWildcard = (accessPolicy?: AccessPolicy, countryCodes?: string[]) => {
  // Get the users permission groups as a list of codes
  if (!accessPolicy) {
    return ['*'];
  }
  const userPermissionGroups = accessPolicy.getPermissionGroups(countryCodes);
  return ['*', ...userPermissionGroups];
};

const getOrganisationUnitCodes = (options: {
  organisationUnitCode?: string;
  organisationUnitCodes?: string[];
}) => {
  const { organisationUnitCode, organisationUnitCodes } = options;
  const orgUnitCodes =
    organisationUnitCodes || (organisationUnitCode ? [organisationUnitCode] : null);
  return orgUnitCodes;
};

export class DataBroker {
  public readonly context: Context;

  private readonly models: DataBrokerModelRegistry;
  private readonly dataServiceResolver: DataServiceResolver;
  private readonly resultMergers: Record<DataSourceType, ResultMerger>;
  private readonly fetchers: Record<DataSourceType, Fetcher>;
  private readonly permissionCheckers: Record<DataSourceType, PermissionChecker>;

  public constructor(context = {}) {
    this.context = context;
    this.models = getModelRegistry();
    this.dataServiceResolver = new DataServiceResolver(this.models);
    this.resultMergers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.mergeAnalytics,
      [this.getDataSourceTypes().DATA_GROUP]: this.mergeEvents,
      [this.getDataSourceTypes().SYNC_GROUP]: this.mergeSyncGroups,
    };
    this.fetchers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.fetchFromDataElementTable,
      [this.getDataSourceTypes().DATA_GROUP]: this.fetchFromDataGroupTable,
      // @ts-ignore
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

  private getUserPermissions(countryCodes?: string[]) {
    return getPermissionListWithWildcard(this.context.accessPolicy, countryCodes);
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

  private fetchFromSyncGroupTable = async (dataSourceSpec: FetchConditions) => {
    // Add 'type' field to output to keep object layout consistent between tables
    const syncGroups = await this.models.dataServiceSyncGroup.find({ code: dataSourceSpec.code });
    return syncGroups.map(sg => ({ ...sg, type: this.getDataSourceTypes().SYNC_GROUP }));
  };

  private getCountryCodes = async (organisationUnitCodes: string[]) => {
    const orgUnits = await this.models.entity.find({ code: organisationUnitCodes });
    const orgUnitCountryCodes = orgUnits.map(orgUnit => orgUnit.country_code).filter(isNotNullish);
    const countryCodes = [...new Set(orgUnitCountryCodes)];
    return countryCodes;
  };

  private checkDataElementPermissions = async (
    dataElements: DataSource[],
    countryCodes: string[] | null,
  ) => {
    const allUserPermissions = this.getUserPermissions();
    if (allUserPermissions.includes(BES_ADMIN_PERMISSION_GROUP)) {
      return true;
    }

    const getDataElementsWithMissingPermissions = (permissions: string[]) =>
      (dataElements as DataElement[])
        .filter(element => element.permission_groups.length > 0)
        .filter(element => !element.permission_groups.some(group => permissions.includes(group)))
        .map(element => element.code);

    if (countryCodes === null) {
      const missingPermissions = getDataElementsWithMissingPermissions(allUserPermissions);
      if (missingPermissions.length > 0) {
        throw new Error(
          `Missing permissions to the following data elements: ${missingPermissions}`,
        );
      }

      return true;
    }

    const missingPermissionsPerCountry: Record<string, string[]> = {};
    countryCodes.forEach(country => {
      const missingPermissions = getDataElementsWithMissingPermissions(
        this.getUserPermissions([country]),
      );
      if (missingPermissions.length > 0) {
        missingPermissionsPerCountry[country] = missingPermissions;
      }
    });

    if (Object.keys(missingPermissionsPerCountry).length > 0) {
      const missingPermissionsPerCountryString = Object.entries(missingPermissionsPerCountry)
        .map(([country, permissions]) => `${country}: ${permissions}`)
        .join('\n');
      throw new Error(
        `Missing permissions to the following data elements:\n${missingPermissionsPerCountryString}`,
      );
    }

    return true;
  };

  private checkDataGroupPermissions = async (
    dataGroups: DataSource[],
    countryCodes: string[] | null,
  ) => {
    const missingPermissions = [];
    for (const group of dataGroups) {
      const dataElements = await this.models.dataGroup.getDataElementsInDataGroup(group.code);
      try {
        await this.checkDataElementPermissions(dataElements, countryCodes);
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

  public async push(
    dataSourceSpec: DataSourceSpec,
    data: unknown,
    options: { organisationUnitCode?: string } = {},
  ) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const { type: dataSourceType } = dataSourceSpec;
    const { serviceType, dataServiceMapping } = await this.getSingleServiceAndMapping(
      dataSources,
      options,
    );

    const service = this.createService(serviceType);
    return service.push(dataSources, data, { type: dataSourceType, dataServiceMapping });
  }

  public async delete(
    dataSourceSpec: DataSourceSpec,
    data: unknown,
    options: Record<string, unknown>,
  ) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const [dataSource] = dataSources;
    const { serviceType, dataServiceMapping } = await this.getSingleServiceAndMapping(
      dataSources,
      options,
    );

    const service = this.createService(serviceType);
    return service.delete(dataSource, data, {
      type: dataSourceSpec.type,
      dataServiceMapping,
      ...options,
    });
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
  public async pull(dataSourceSpec: DataSourceSpec, options: Record<string, unknown> = {}) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const { type } = dataSourceSpec;
    const orgUnitCodes = getOrganisationUnitCodes(options);

    const pulls = await this.getPulls(dataSources, orgUnitCodes);
    const nestedResults = await Promise.all(
      pulls.map(({ dataSources: dataSourcesForThisPull, serviceType, dataServiceMapping }) => {
        return this.pullForServiceAndType(
          dataSourcesForThisPull,
          options,
          type,
          serviceType,
          dataServiceMapping,
        );
      }),
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
    serviceType: ServiceType,
    dataServiceMapping: DataServiceMapping,
  ) => {
    const organisationUnitCodes = getOrganisationUnitCodes(options);
    const countryCodes =
      organisationUnitCodes === null
        ? null // null countryCodes will get permissions for any countries
        : await this.getCountryCodes(organisationUnitCodes);
    const permissionChecker = this.permissionCheckers[type];
    // Permission checkers will throw if they fail
    await permissionChecker(dataSources, countryCodes);
    const service = this.createService(serviceType);
    return service.pull(dataSources, type, { ...options, dataServiceMapping });
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
    const { serviceType, dataServiceMapping } = await this.getSingleServiceAndMapping(
      dataSources,
      options,
    );

    const service = this.createService(serviceType);
    // `dataSourceSpec` is defined  for a single `type`
    const { type } = dataSourceSpec;
    return service.pullMetadata(dataSources, type, { dataServiceMapping, ...options });
  }

  /**
   * Given some DataSources, returns a single serviceType or throws an error if multiple found
   */
  private async getSingleServiceAndMapping(
    dataSources: DataSourceTypeInstance[],
    options: { organisationUnitCode?: string } = {},
  ): Promise<{ serviceType: ServiceType; dataServiceMapping: DataServiceMapping }> {
    const { organisationUnitCode } = options;

    const dataServiceMapping = await this.dataServiceResolver.getMappingByOrgUnitCode(
      dataSources,
      organisationUnitCode,
    );
    if (dataServiceMapping.uniqueServiceTypes().length > 1) {
      throw new Error('Multiple data service types found, only a single service type expected');
    }

    const [serviceType] = dataServiceMapping.uniqueServiceTypes();
    return {
      serviceType,
      dataServiceMapping,
    };
  }

  private async getPulls(
    dataSources: DataSourceTypeInstance[],
    orgUnitCodes: string[] | null,
  ): Promise<
    {
      dataSources: DataSource[];
      serviceType: ServiceType;
      dataServiceMapping: DataServiceMapping;
    }[]
  > {
    // Special case where no org unit is provided
    if (orgUnitCodes === null) {
      const pulls = [];
      const mapping = await this.dataServiceResolver.getMapping(dataSources);
      for (const serviceType of mapping.uniqueServiceTypes()) {
        pulls.push({
          dataSources,
          serviceType,
          dataServiceMapping: mapping,
        });
      }
      return pulls;
    }

    // Note: each service will pull for ALL org units and ALL data sources.
    // This will likely lead to problems in the future, for now this is ok because
    // our services happily ignore extra org units, and our vizes do not ask for
    // data elements that don't exist in dhis (dhis throws if it cant find it).
    // Update 2023-01-19: At this time DHIS and superset will ignore data elements
    // that are not relevant to them, but a proper cleanup should still be done
    // to not even pass these services unrelated data elements in the first place.

    // First we get the mapping for each country, then if any two countries have the
    // exact same mapping we simply combine them
    const countryCodes = await this.getCountryCodes(orgUnitCodes);

    if (countryCodes.length === 1) {
      // No special logic needed, exit early
      const [countryCode] = countryCodes;
      const dataServiceMapping = await this.dataServiceResolver.getMappingByCountryCode(
        dataSources,
        countryCode,
      );
      return Object.entries(dataServiceMapping.dataSourcesByServiceType()).map(
        ([serviceType, dataSourcesForThisServiceType]) => ({
          dataSources: dataSourcesForThisServiceType,
          serviceType: serviceType as ServiceType,
          dataServiceMapping,
        }),
      );
    }

    const mappingsByCountryCode: Record<string, DataServiceMapping> = {};
    for (const countryCode of countryCodes) {
      mappingsByCountryCode[countryCode] = await this.dataServiceResolver.getMappingByCountryCode(
        dataSources,
        countryCode,
      );
    }

    const uniqueMappings: DataServiceMapping[] = [];
    for (const mappingA of Object.values(mappingsByCountryCode)) {
      let alreadyAdded = false;
      for (const mappingB of uniqueMappings) {
        if (mappingA === mappingB) continue;
        if (mappingA.equals(mappingB)) {
          alreadyAdded = true;
          break;
        }
      }
      if (!alreadyAdded) uniqueMappings.push(mappingA);
    }

    // And finally split each by service type
    const pulls = [];
    for (const mapping of uniqueMappings) {
      for (const serviceType of mapping.uniqueServiceTypes()) {
        pulls.push({
          dataSources,
          serviceType,
          dataServiceMapping: mapping,
        });
      }
    }

    return pulls;
  }
}
