/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { RouteHandler } from './RouteHandler';
import { createAggregator } from '@tupaia/aggregator';
import { Aggregator } from '../aggregator';

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
  fetchDataSourceEntities = async (entity, defaultEntityType) => {
    // if a specific type was specified in either the query or the function parameter, build org
    // units of that type (otherwise we just use the nearest org unit descendants)
    const dataSourceEntityType = this.query.dataSourceEntityType || defaultEntityType;
    // if this entity is a project, follow the alternative hierarchy matching its name
    const hierarchyId = entity.isProject() ? (await entity.project()).entity_hierarchy_id : null;
    const dataSourceEntities = dataSourceEntityType
      ? await entity.getDescendantsOfType(dataSourceEntityType, hierarchyId)
      : await entity.getNearestOrgUnitDescendants(hierarchyId);
    const entityAccessList = await Promise.all(
      dataSourceEntities.map(({ code }) => this.permissionsChecker.checkHasEntityAccess(code)),
    );
    return dataSourceEntities.filter((_, i) => entityAccessList[i]);
  };
}
