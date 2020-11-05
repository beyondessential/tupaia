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
    this.aggregator = createAggregator(Aggregator, this.models, this);
  }

  // Builds the list of entities data should be fetched from, using org unit descendants of the
  // selected entity (optionally of a specific entity type)
  fetchDataSourceEntities = async (entityCode, options) => {
    const { dataSourceEntityType, ...restOfOptions } = options;
    if (Array.isArray(dataSourceEntityType)) {
      return (
        await Promise.all(
          dataSourceEntityType.map(entityType =>
            this.fetchAndFilterDataSourceEntitiesOfType(entityCode, entityType, restOfOptions),
          ),
        )
      ).flat();
    }

    const entityType = dataSourceEntityType || this.query.dataSourceEntityType;
    const entity = await this.models.entity.findOne({ code: entityCode });
    return this.fetchAndFilterDataSourceEntitiesOfType(entity, entityType, restOfOptions);
  };

  fetchAndFilterDataSourceEntitiesOfType = async (entity, entityType, options) => {
    const { dataSourceEntityFilter, ...restOfOptions } = options;

    const allDataSourceEntities = await this.fetchDataSourceEntitiesOfType(
      entity,
      entityType,
      restOfOptions,
    );

    const permittedEntities = await this.filterOutNonPermittedEntities(allDataSourceEntities);

    if (dataSourceEntityFilter) {
      return filterEntities(permittedEntities, dataSourceEntityFilter);
    }
    return permittedEntities;
  };

  fetchDataSourceEntitiesOfType = async (entity, entityType, options) => {
    const { includeSiblingData, aggregationEntityType } = options;
    const hierarchyId = await this.fetchHierarchyId();

    // if no entity type is specified, we should just use the closest "canonical org unit" descendants
    // this is the "old way", and exists to support older dashboard reports fetching from DHIS2
    if (!entityType) {
      return entity.getNearestOrgUnitDescendants(hierarchyId);
    }

    // fetch siblings via the common ancestor if includeSiblingData is true
    //    A
    //   / \
    //  B   C
    // this is when we are at B and want to fetch data for both B and C
    //
    if (includeSiblingData) {
      const ancestor = await entity.getAncestorOfType(aggregationEntityType, hierarchyId);
      return ancestor.getDescendantsOfType(entityType, hierarchyId);
    }

    // if the entity we're building for is of the correct type already, just use that
    if (entity.type === entityType) {
      return [entity];
    }

    // check both directions for related entities of the correct type, starting with ancestors
    // as it's a narrower/faster path to follow than spreading out to descendants
    const ancestor = await entity.getAncestorOfType(hierarchyId, entityType);
    return ancestor ? [ancestor] : entity.getDescendantsOfType(hierarchyId, entityType);
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
}
