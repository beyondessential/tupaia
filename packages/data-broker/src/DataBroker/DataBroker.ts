import { lower } from 'case';

import type { AccessPolicy } from '@tupaia/access-policy';
import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { toArray } from '@tupaia/utils';
import { createService } from '../services';
import { DataServiceResolver } from '../services/DataServiceResolver';
import {
  RawAnalyticResults,
  DataBrokerModelRegistry,
  DataSourceTypeInstance,
  DataSourceType,
  EventResults,
  ServiceType,
  SyncGroupResults,
} from '../types';
import { DATA_SOURCE_TYPES, EMPTY_ANALYTICS_RESULTS } from '../utils';
import { DataServiceMapping } from '../services/DataServiceMapping';
import { fetchDataElements, fetchDataGroups, fetchSyncGroups } from './fetchDataSources';
import { AnalyticResults, mergeAnalytics } from './mergeAnalytics';
import { fetchOrgUnitsByCountry } from './fetchOrgUnitsByCountry';
import {
  fetchAllowedOrgUnitsForDataElements,
  fetchAllowedOrgUnitsForDataGroups,
} from './fetchAllowedOrgUnits';

export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

type Context = {
  accessPolicy?: AccessPolicy;
};

export interface DataSourceSpec<T extends DataSourceType = DataSourceType> {
  code: string | string[];
  type: T;
}

type FetchConditions = { code: string | string[] };

type Fetcher = (dataSourceSpec: FetchConditions) => Promise<DataSourceTypeInstance[]>;

type PullOptions = Record<string, unknown> & {
  organisationUnitCode?: string;
  organisationUnitCodes?: string[];
};

type PullMetadataOptions = Record<string, unknown> & {
  organisationUnitCode?: string;
};

let modelRegistry: DataBrokerModelRegistry;

const getModelRegistry = () => {
  if (!modelRegistry) {
    modelRegistry = new ModelRegistry(new TupaiaDatabase());
  }
  return modelRegistry;
};

const getOrganisationUnitCodes = (options: PullOptions) => {
  const { organisationUnitCode, organisationUnitCodes } = options;
  return organisationUnitCodes || (organisationUnitCode ? [organisationUnitCode] : undefined);
};

interface Pull<T extends DataSourceTypeInstance> {
  dataSources: T[];
  serviceType: ServiceType;
  dataServiceMapping: DataServiceMapping;
}

export class DataBroker {
  public readonly context: Context;

  private readonly models: DataBrokerModelRegistry;
  private readonly dataServiceResolver: DataServiceResolver;
  private readonly fetchers: Record<DataSourceType, Fetcher>;

  public constructor(context = {}) {
    this.context = context;
    this.models = getModelRegistry();
    this.dataServiceResolver = new DataServiceResolver(this.models);
    this.fetchers = {
      [this.getDataSourceTypes().DATA_ELEMENT]: this.fetchFromDataElementTable,
      [this.getDataSourceTypes().DATA_GROUP]: this.fetchFromDataGroupTable,
      [this.getDataSourceTypes().SYNC_GROUP]: this.fetchFromSyncGroupTable,
    };
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
    return this.models.dataServiceSyncGroup.find({ code: dataSourceSpec.code });
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

  public async pullAnalytics(
    dataElementCodes: string[],
    options: PullOptions,
  ): Promise<AnalyticResults> {
    const dataElements = await fetchDataElements(this.models, dataElementCodes);
    const organisationUnitCodes = getOrganisationUnitCodes(options);
    const pulls = await this.getPulls(dataElements, organisationUnitCodes);
    const allowedOrgUnits = await fetchAllowedOrgUnitsForDataElements(
      this.models,
      dataElements,
      this.context.accessPolicy,
      organisationUnitCodes,
    );

    const nestedResults = await Promise.all(
      pulls.map(({ dataSources, serviceType, dataServiceMapping }) => {
        const service = this.createService(serviceType);
        return service.pullAnalytics(dataSources, {
          ...options,
          dataServiceMapping,
          organisationUnitCodes: allowedOrgUnits,
        });
      }),
    );

    return (nestedResults as RawAnalyticResults[]).reduce(
      (results, resultsForService) => mergeAnalytics(results, resultsForService),
      EMPTY_ANALYTICS_RESULTS as AnalyticResults,
    );
  }

  public async pullEvents(dataGroupCodes: string[], options: PullOptions): Promise<EventResults> {
    const dataGroups = await fetchDataGroups(this.models, dataGroupCodes);
    const organisationUnitCodes = getOrganisationUnitCodes(options);
    const pulls = await this.getPulls(dataGroups, organisationUnitCodes);
    const allowedOrgUnits = await fetchAllowedOrgUnitsForDataGroups(
      this.models,
      dataGroups,
      this.context.accessPolicy,
      organisationUnitCodes,
    );

    const nestedResults = await Promise.all(
      pulls.map(({ dataSources, serviceType, dataServiceMapping }) => {
        const service = this.createService(serviceType);
        return service.pullEvents(dataSources, {
          ...options,
          dataServiceMapping,
          organisationUnitCodes: allowedOrgUnits,
        });
      }),
    );

    return (nestedResults as EventResults[]).flat();
  }

  public async pullSyncGroupResults(
    syncGroupCodes: string[],
    options: PullOptions,
  ): Promise<SyncGroupResults> {
    const syncGroups = await fetchSyncGroups(this.models, syncGroupCodes);
    const organisationUnitCodes = getOrganisationUnitCodes(options);
    const pulls = await this.getPulls(syncGroups, organisationUnitCodes);

    const nestedResults = await Promise.all(
      pulls.map(({ dataSources, serviceType, dataServiceMapping }) => {
        const service = this.createService(serviceType);
        return service.pullSyncGroupResults(dataSources, {
          ...options,
          dataServiceMapping,
          organisationUnitCodes,
        });
      }),
    );

    return (nestedResults as SyncGroupResults[]).reduce(
      (results, resultsForService) => ({
        ...results,
        ...resultsForService,
      }),
      {},
    );
  }

  public async pullDataElements(codes: string[], options?: PullMetadataOptions) {
    const dataElements = await fetchDataElements(this.models, codes);
    const { serviceType, dataServiceMapping } = await this.getSingleServiceAndMapping(
      dataElements,
      options,
    );

    const service = this.createService(serviceType);
    return service.pullMetadata(dataElements, 'dataElement', { dataServiceMapping, ...options });
  }

  public async pullDataGroup(code: string, options?: PullMetadataOptions) {
    const [dataGroup] = await fetchDataGroups(this.models, [code]);
    const { serviceType, dataServiceMapping } = await this.getSingleServiceAndMapping(
      [dataGroup],
      options,
    );

    const service = this.createService(serviceType);
    return service.pullMetadata([dataGroup], 'dataGroup', { dataServiceMapping, ...options });
  }

  /**
   * Given some DataSources, returns a single serviceType or throws an error if multiple found
   */
  private async getSingleServiceAndMapping(
    dataSources: DataSourceTypeInstance[],
    options: PullMetadataOptions = {},
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

  private async getPulls<T extends DataSourceTypeInstance>(
    dataSources: T[],
    orgUnitCodes?: string[],
  ): Promise<Pull<T>[]> {
    // Special case where no org unit is provided
    if (!orgUnitCodes) {
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
    const countryCodes = Object.keys(await fetchOrgUnitsByCountry(this.models, orgUnitCodes));

    if (countryCodes.length === 1) {
      // No special logic needed, exit early
      const [countryCode] = countryCodes;
      const dataServiceMapping = await this.dataServiceResolver.getMappingByCountryCode(
        dataSources,
        countryCode,
      );
      return Object.entries(dataServiceMapping.dataSourcesByServiceType()).map(
        ([serviceType, dataSourcesForThisServiceType]) => ({
          dataSources: dataSourcesForThisServiceType as T[],
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
