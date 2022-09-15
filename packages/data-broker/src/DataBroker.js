/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { lower } from 'case';
import isequal from 'lodash.isequal';

import { ModelRegistry, TupaiaDatabase } from '@tupaia/database';
import { countDistinct, toArray } from '@tupaia/utils';
import { createService } from './services';
import { DATA_SOURCE_TYPES } from './utils';
import { DataServiceResolver } from './services/DataServiceResolver';

export const BES_ADMIN_PERMISSION_GROUP = 'BES Admin';

let modelRegistry;

const getModelRegistry = () => {
  if (!modelRegistry) {
    modelRegistry = new ModelRegistry(new TupaiaDatabase());
  }
  return modelRegistry;
};

const getPermissionListWithWildcard = async accessPolicy => {
  // Get the users permission groups as a list of codes
  if (!accessPolicy) {
    return ['*'];
  }
  const userPermissionGroups = accessPolicy.getPermissionGroups();
  return ['*', ...userPermissionGroups];
};

export class DataBroker {
  constructor(context = {}) {
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

  async getUserPermissions() {
    if (!this.userPermissions) {
      this.userPermissions = await getPermissionListWithWildcard(this.context.accessPolicy);
    }
    return this.userPermissions;
  }

  async close() {
    return this.models.closeDatabaseConnections();
  }

  getDataSourceTypes() {
    return DATA_SOURCE_TYPES;
  }

  fetchFromDataElementTable = async dataSourceSpec => {
    return this.models.dataElement.find(dataSourceSpec);
  };

  fetchFromDataGroupTable = async dataSourceSpec => {
    return this.models.dataGroup.find(dataSourceSpec);
  };

  fetchFromSyncGroupTable = async dataSourceSpec => {
    // Add 'type' field to output to keep object layout consistent between tables
    const syncGroups = await this.models.dataServiceSyncGroup.find({ code: dataSourceSpec.code });
    return syncGroups.map(sg => ({ ...sg, type: this.getDataSourceTypes().SYNC_GROUP }));
  };

  checkDataElementPermissions = async dataElements => {
    const userPermissions = await this.getUserPermissions();
    if (userPermissions.includes(BES_ADMIN_PERMISSION_GROUP)) {
      return true;
    }
    const missingPermissions = [];
    for (const element of dataElements) {
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

  checkDataGroupPermissions = async dataGroups => {
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
  checkSyncGroupPermissions = () => {
    return true;
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

  async push(dataSourceSpec, data, options = {}) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const { type: dataSourceType } = dataSourceSpec;
    const { serviceType, dataServiceMapping } = await this.getSingleServiceAndMapping(
      dataSources,
      options,
    );

    const service = this.createService(serviceType);
    return service.push(dataSources, data, { type: dataSourceType, dataServiceMapping });
  }

  async delete(dataSourceSpec, data, options = {}) {
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

  async pull(dataSourceSpec, options = {}) {
    const dataSources = await this.fetchDataSources(dataSourceSpec);
    const { type } = dataSourceSpec;
    const { organisationUnitCode, organisationUnitCodes } = options;
    const orgUnitCodes = organisationUnitCodes || [organisationUnitCode];

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
      (results, resultsForService) => mergeResults(results, resultsForService),
      undefined,
    );
  }

  pullForServiceAndType = async (dataSources, options, type, serviceType, dataServiceMapping) => {
    const permissionChecker = this.permissionCheckers[type];
    // Permission checkers will throw if they fail
    await permissionChecker(dataSources);
    const service = this.createService(serviceType);
    return service.pull(dataSources, type, { dataServiceMapping, ...options });
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

  async pullMetadata(dataSourceSpec, options = {}) {
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
   * @private
   * @param {DataSource[]} dataSources
   * @param {{organisationUnitCode?: string}} options
   * @return {Promise<{ serviceType: string, mapping: DataServiceMapping }>}
   */
  async getSingleServiceAndMapping(dataSources, options = {}) {
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

  async getPulls(dataSources, orgUnitCodes) {
    const orgUnits = await this.models.entity.find({ code: orgUnitCodes });

    // Note: each service will pull for ALL org units and ALL data sources.
    // This will likely lead to problems in the future, for now this is ok because
    // our services happily ignore extra org units, and our vizes do not ask for
    // data elements that don't exist in dhis (dhis throws if it cant find it).

    // First we get the mapping for each country, then if any two countries have the
    // exact same mapping we simply combine them
    const orgUnitCountryCodes = orgUnits
      .map(orgUnit => orgUnit.country_code)
      .filter(countryCode => countryCode !== null && countryCode !== undefined);
    const countryCodes = [...new Set(orgUnitCountryCodes)];

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
          serviceType,
          dataServiceMapping,
        }),
      );
    }

    const mappingsByCountryCode = {};
    for (const countryCode of countryCodes) {
      mappingsByCountryCode[countryCode] = await this.dataServiceResolver.getMappingByCountryCode(
        dataSources,
        countryCode,
      );
    }

    const uniqueMappings = [];
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
