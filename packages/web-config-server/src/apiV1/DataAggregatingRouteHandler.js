/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { createAggregator } from '@tupaia/aggregator';
import { RouteHandler } from './RouteHandler';
import { Aggregator } from '/aggregator';
import { filterEntities } from './utils';

/**
 * Interface class for handling routes that fetch data from an aggregator
 * buildResponse must be implemented
 */
export class DataAggregatingRouteHandler extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    this.aggregator = createAggregator(Aggregator, this);
  }

  findAllDataSourceEntities = async (entity, entityType, hierarchyId) => {
    // if no entity type is specified, we should just use the closest "canonical org unit" descendants
    // this is the "old way", and exists to support older dashboard reports fetching from DHIS2
    if (!entityType) {
      return entity.getNearestOrgUnitDescendants(hierarchyId);
    }

    // if the entity we're building for is of the correct type already, just use that
    if (entity.type === entityType) {
      return [entity];
    }

    // check both directions for related entities of the correct type, starting with ancestors
    // as it's a narrower/faster path to follow than spreading out to descendants
    const ancestor = await entity.getAncestorOfType(entityType, hierarchyId);
    return ancestor ? [ancestor] : entity.getDescendantsOfType(entityType, hierarchyId);
  };

  filterOutNonPermittedEntities = async entities => {
    const countryCodes = [...new Set(entities.map(e => e.country_code))];
    const countryAccessList = await Promise.all(
      countryCodes.map(countryCode => this.permissionsChecker.checkHasEntityAccess(countryCode)),
    );
    const countryAccess = countryCodes.reduce(
      (obj, countryCode, i) => ({ ...obj, [countryCode]: countryAccessList[i] }),
      {},
    );
    return entities.filter(e => countryAccess[e.country_code]);
  };

  // Builds the list of entities data should be fetched from, using org unit descendants of the
  // selected entity (optionally of a specific entity type)
  fetchDataSourceEntities = async (entity, dataSourceEntityType, dataSourceEntityFilter) => {
    const entityType = dataSourceEntityType || this.query.dataSourceEntityType;
    const hierarchyId = await this.fetchHierarchyId();
    const allDataSourceEntities = await this.findAllDataSourceEntities(
      entity,
      entityType,
      hierarchyId,
    );

    const permittedEntities = await this.filterOutNonPermittedEntities(allDataSourceEntities);

    if (dataSourceEntityFilter) {
      return filterEntities(permittedEntities, dataSourceEntityFilter);
    }
    return permittedEntities;
  };
}
