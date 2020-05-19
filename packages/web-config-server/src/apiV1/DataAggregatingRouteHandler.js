/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';
import { Project } from '../models';

/**
 * Interface class for handling routes that fetch data from an aggregator
 * buildResponse must be implemented
 */
export class DataAggregatingRouteHandler extends RouteHandler {
  constructor(req, res) {
    super(req, res);
    this.aggregator = createAggregator(Aggregator, this.fetchDataSourceEntities);
  }

  // Builds the list of entities data should be fetched from, using org unit descendents of the
  // selected entity (optionally of a specific entity type)
  fetchDataSourceEntities = async (entity, dataSourceEntityType) => {
    // if a specific type was specified in either the query or the function parameter, build org
    // units of that type (otherwise we just use the nearest org unit descendants)

    const entityType = this.query.dataSourceEntityType || dataSourceEntityType;
    const hierarchyId = (await Project.findOne({ code: this.query.projectCode }))
      .entity_hierarchy_id;

    const dataSourceEntities = entityType
      ? await entity.getDescendantsOfType(entityType, hierarchyId)
      : await entity.getNearestOrgUnitDescendants(hierarchyId);

    const countryCodes = [...new Set(dataSourceEntities.map(e => e.country_code))];
    const countryAccessList = await Promise.all(
      countryCodes.map(countryCode => this.permissionsChecker.checkHasEntityAccess(countryCode)),
    );
    const countryAccess = countryCodes.reduce(
      (obj, countryCode, i) => ({ ...obj, [countryCode]: countryAccessList[i] }),
      {},
    );
    return dataSourceEntities.filter(e => countryAccess[e.country_code]);
  };
}
