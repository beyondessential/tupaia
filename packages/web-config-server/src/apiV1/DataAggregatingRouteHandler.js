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

  // Builds the list of entities data should be fetched from, using org unit descendants of the
  // selected entity (optionally of a specific entity type)
  fetchDataSourceEntities = async (entity, options) => {
    const { dataSourceEntityType } = options;
    if (Array.isArray(dataSourceEntityType)) {
      return (
        await Promise.all(
          dataSourceEntityType.map(entityType =>
            this.fetchDataSourceEntitiesOfType(entity, entityType, options),
          ),
        )
      ).flat();
    }
    // if a specific type was specified in either the query or the function parameter, build org
    // units of that type (otherwise we just use the nearest org unit descendants)
    const entityType = dataSourceEntityType || this.query.dataSourceEntityType;
    return this.fetchDataSourceEntitiesOfType(entity, entityType, options);
  };

  fetchDataSourceEntitiesOfType = async (entity, entityType, options) => {
    const { includeSiblingData, aggregationEntityType, dataSourceEntityFilter } = options;
    const hierarchyId = await this.fetchHierarchyId();

    let dataSourceEntities = [];
    if (entityType) {
      /**
       *    A
       *   / \
       *  B   C
       * This is when we are at B and want to fetch data for both B and C
       */
      if (includeSiblingData) {
        const ancestor = await entity.getAncestorOfType(aggregationEntityType, hierarchyId);
        dataSourceEntities = await ancestor.getDescendantsOfType(entityType, hierarchyId);
      } else {
        const ancestor = await entity.getAncestorOfType(entityType, hierarchyId);
        if (ancestor && ancestor.type !== entity.type) {
          dataSourceEntities = [ancestor];
        } else {
          dataSourceEntities = await entity.getDescendantsOfType(entityType, hierarchyId);
        }
      }
    } else {
      dataSourceEntities = await entity.getNearestOrgUnitDescendants(hierarchyId);
    }

    const countryCodes = [...new Set(dataSourceEntities.map(e => e.country_code))];
    const countryAccessList = await Promise.all(
      countryCodes.map(countryCode => this.permissionsChecker.checkHasEntityAccess(countryCode)),
    );
    const countryAccess = countryCodes.reduce(
      (obj, countryCode, i) => ({ ...obj, [countryCode]: countryAccessList[i] }),
      {},
    );
    dataSourceEntities = dataSourceEntities.filter(e => countryAccess[e.country_code]);

    if (dataSourceEntityFilter) {
      dataSourceEntities = filterEntities(dataSourceEntities, dataSourceEntityFilter);
    }

    return dataSourceEntities;
  };
}
