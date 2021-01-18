/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

const DEFAULT_LIMIT = 20;

export default class extends RouteHandler {
  // allow passing straight through, results are limited by permissions
  static PermissionsChecker = NoPermissionRequiredChecker;

  async getMatchingEntities(searchString, entities, limit, startIndex) {
    if (startIndex >= entities.length) {
      return [];
    }

    const safeSearchString = searchString.replace(/[-[\]{}()*+?.,\\^$|#\\]/g, '\\$&'); // Need to escape special regex chars from query
    const comparators = [
      entity => new RegExp(`^${safeSearchString}`, 'i').test(entity.name), // Name starts with query string
      entity => new RegExp(`^(?!${safeSearchString}).*${safeSearchString}`, 'i').test(entity.name), // Name contains query string
    ];
    const isEndOfSearch = (entityIndex, comparatorIndex) =>
      entityIndex === entities.length - 1 && comparatorIndex === comparators.length - 1;
    const matchingEntitiesBatch = [];
    let matchingEntitiesIndex = 0;
    let hasMoreResults = true;

    for (let comparatorIndex = 0; comparatorIndex < comparators.length; comparatorIndex++) {
      const comparator = comparators[comparatorIndex];
      for (
        let entityIndex = 0;
        entityIndex < entities.length && matchingEntitiesBatch.length < limit;
        entityIndex++
      ) {
        const entity = entities[entityIndex];
        if (comparator(entity) && (await this.req.userHasAccess(entity.country_code))) {
          matchingEntitiesIndex++;

          // Start pushing matching entities to the result list if we have reached the start index query parameter
          if (matchingEntitiesIndex > startIndex) {
            matchingEntitiesBatch.push(entity);
          }
        }

        // If we have searched all the entities, return hasMoreResults = false to the front end
        if (isEndOfSearch(entityIndex, comparatorIndex)) {
          hasMoreResults = false;
        }
      }
    }

    return { matchingEntities: matchingEntitiesBatch, hasMoreResults };
  }

  async getSearchResults(searchString, limit, startIndex) {
    const project = await this.fetchProject();
    const projectEntity = await project.entity();

    const allEntities = await projectEntity.getDescendants(project.entity_hierarchy_id, {
      type: {
        comparator: 'not in',
        comparisonValue: this.models.entity.typesExcludedFromWebFrontend,
      },
    });
    const { matchingEntities, hasMoreResults } = await this.getMatchingEntities(
      searchString,
      allEntities,
      limit,
      startIndex,
    );

    const childIdToParentId = await this.models.ancestorDescendantRelation.getChildIdToParentId(
      project.entity_hierarchy_id,
    );
    const entityById = keyBy(allEntities, 'id');
    return this.formatForResponse(matchingEntities, childIdToParentId, entityById, hasMoreResults);
  }

  formatForResponse = (entities, childIdToParentId, entityById, hasMoreResults) => {
    const searchResults = entities.map(entity => {
      const displayName = buildEntityAddress(entity, childIdToParentId, entityById);
      return {
        organisationUnitCode: entity.code,
        displayName,
      };
    });

    return { searchResults, hasMoreResults };
  };

  buildResponse = async () => {
    const { limit = DEFAULT_LIMIT, criteria: searchString, startIndex = 0 } = this.req.query;
    if (!searchString || searchString === '' || isNaN(parseInt(limit, 10))) {
      throw new Error('Query parameters must match "criteria" (text) and "limit" (number)');
    }
    return this.getSearchResults(searchString, limit, startIndex);
  };
}

const buildEntityAddress = (entity, childIdToParentId, entityById) => {
  const getParent = child =>
    childIdToParentId[child.id]
      ? entityById[childIdToParentId[child.id]]
      : entityById[child.parent_id];

  const address = [entity];
  let parentEntity = getParent(entity);
  while (parentEntity) {
    address.push(parentEntity);
    parentEntity = getParent(parentEntity);
  }
  return address.map(ancestor => ancestor.name).join(', ');
};
