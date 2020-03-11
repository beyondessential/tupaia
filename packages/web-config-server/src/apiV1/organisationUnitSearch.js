/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import { Entity, ORG_UNIT_ENTITY_TYPES } from '/models/Entity';
import { RouteHandler } from './RouteHandler';
import { getEntityLocationForFrontend } from './utils/getEntityLocationForFrontend';

const DEFAULT_LIMIT = 20;

export default class extends RouteHandler {
  getNextResults = async (filter, limit, pageNumber = 0) => {
    const sort = ['name'];
    return Entity.find(filter, {}, { sort, limit, offset: pageNumber * limit });
  };

  async getResultsWithMatchType(shouldMatchStart, searchString, limit, alreadyFetchedIds) {
    // Keep trying to get results as the first page may have some filtered out if they are not accessible
    // by this user
    const comparisonValue = shouldMatchStart ? `${searchString}%` : `%${searchString}%`;
    const filter = {
      name: { comparator: 'ilike', comparisonValue },
      type: Object.values(ORG_UNIT_ENTITY_TYPES),
      code: { comparator: '<>', comparisonValue: 'World' },
    };
    if (alreadyFetchedIds) {
      filter.id = { args: [alreadyFetchedIds], comparisonType: 'whereNotIn' };
    }
    let allResults = [];
    let pageNumber = 0;
    while (allResults.length < limit) {
      const entities = await this.getNextResults(filter, limit, pageNumber);
      if (entities.length === 0) {
        break;
      }
      // Filter out any organisation units that should not be in the entities for this user
      const entitiesWithAccess = await this.removeEntitiesWithoutAccess(entities);
      allResults = [...allResults, ...entitiesWithAccess];
      pageNumber++;
    }
    return allResults.slice(0, limit); // Slice as we may have overshot during pagination
  }

  async getPrimaryResults(searchString, limit) {
    // Match from start for primary
    return this.getResultsWithMatchType(true, searchString, limit);
  }

  async getSecondaryResults(searchString, limit, alreadyFetchedIds) {
    // Match anywhere for secondary
    return this.getResultsWithMatchType(false, searchString, limit, alreadyFetchedIds);
  }

  async getResults(searchString, limit) {
    const primaryResults = await this.getPrimaryResults(searchString, limit);
    const remainingToFind = limit - primaryResults.length;
    if (remainingToFind === 0) {
      return primaryResults;
    }
    const secondaryResults = await this.getSecondaryResults(
      searchString,
      remainingToFind,
      primaryResults.map(entity => entity.id),
    );
    return [...primaryResults, ...secondaryResults];
  }

  removeEntitiesWithoutAccess = async (entities, userGroup) => {
    const entityAccess = await Promise.all(
      entities.map(async entity => this.req.userHasAccess(entity, userGroup)),
    );
    return entities.filter((e, i) => entityAccess[i]);
  };

  formatForResponse = async entities => {
    return Promise.all(
      entities.map(async entity => {
        const displayName = await entity.buildDisplayName();
        const location = getEntityLocationForFrontend(entity);
        return {
          organisationUnitCode: entity.code,
          displayName,
          location,
        };
      }),
    );
  };

  buildResponse = async req => {
    this.req = req;
    const { limit = DEFAULT_LIMIT, criteria: searchString } = req.query;
    const results = await this.getResults(searchString, limit);
    return this.formatForResponse(results);
  };
}
