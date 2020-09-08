/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { Entity } from '/models';
import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

const DEFAULT_LIMIT = 20;

export default class extends RouteHandler {
  // allow passing straight through, results are limited by permissions
  static PermissionsChecker = NoPermissionRequiredChecker;

  async getMatchingEntities(searchString, entities, limit) {
    const safeSearchString = searchString.replace(/[-[\]{}()*+?.,\\^$|#\\]/g, '\\$&'); // Need to escape special regex chars from query
    const comparators = [
      entity => new RegExp(`^${safeSearchString}`, 'i').test(entity.name), // Name starts with query string
      entity => new RegExp(`^(?!${safeSearchString}).*${safeSearchString}`, 'i').test(entity.name), // Name contains query string
    ];

    const allResults = [];
    for (let comparatorIndex = 0; comparatorIndex < comparators.length; comparatorIndex++) {
      const comparator = comparators[comparatorIndex];
      for (
        let entityIndex = 0;
        entityIndex < entities.length && allResults.length < limit;
        entityIndex++
      ) {
        const entity = entities[entityIndex];
        if (comparator(entity) && (await this.req.userHasAccess(entity.country_code))) {
          allResults.push(entity);
        }
      }
    }

    return allResults;
  }

  async getSearchResults(searchString, limit) {
    const project = await this.fetchProject();
    const projectEntity = await Entity.findOne({ id: project.entity_id });

    const allEntities = await projectEntity.getDescendants(project.entity_hierarchy_id);
    const matchingEntities = await this.getMatchingEntities(searchString, allEntities, limit);

    const childIdToParentId = await this.models.ancestorDescendantRelation.getChildIdToParentIdMap(
      project.entity_hierarchy_id,
    );
    const entityById = keyBy(allEntities, 'id');
    return this.formatForResponse(matchingEntities, childIdToParentId, entityById);
  }

  formatForResponse = (entities, childIdToParentId, entityById) => {
    return entities.map(entity => {
      const displayName = buildEntityAddress(entity, childIdToParentId, entityById);
      return {
        organisationUnitCode: entity.code,
        displayName,
      };
    });
  };

  buildResponse = async () => {
    const { limit = DEFAULT_LIMIT, criteria: searchString } = this.req.query;
    if (!searchString || searchString === '' || isNaN(parseInt(limit, 10))) {
      throw new Error('Query parameters must match "criteria" (text) and "limit" (number)');
    }
    return this.getSearchResults(searchString, limit);
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
