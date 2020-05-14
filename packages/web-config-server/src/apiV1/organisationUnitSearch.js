/**
 * Tupaia Config Server
 * Copyright (c) 2019 Beyond Essential Systems Pty Ltd
 */

import keyBy from 'lodash.keyby';
import { reduceToDictionary } from '@tupaia/utils';
import { Entity, Project, EntityRelation } from '/models';
import { RouteHandler } from './RouteHandler';
import { NoPermissionRequiredChecker } from './permissions';

const DEFAULT_LIMIT = 20;

export default class extends RouteHandler {
  // allow passing straight through, results are limited by permissions
  static PermissionsChecker = NoPermissionRequiredChecker;

  async getResultsWithMatchType(searchString, entities, limit) {
    const comparitors = [
      entity => new RegExp(`^${searchString}`, 'i').test(entity.name), // Name starts with query string
      entity => new RegExp(`${searchString}`, 'i').test(entity.name), // Name contains query string
    ];

    const allResults = [];
    for (let comparitorIndex = 0; comparitorIndex < comparitors.length; comparitorIndex++) {
      const comparitor = comparitors[comparitorIndex];
      for (
        let entityIndex = 0;
        entityIndex < entities.length && allResults.length < limit;
        entityIndex++
      ) {
        const entity = entities[entityIndex];
        if (
          comparitor(entity) &&
          !allResults.includes(entity) &&
          (await this.req.userHasAccess(entity.country_code))
        ) {
          allResults.push(entity);
        }
      }
    }

    return allResults;
  }

  async getResults(searchString, projectCode, limit) {
    const project = await Project.findOne({ code: projectCode });
    const projectEntity = await Entity.findOne({ id: project.entity_id });
    const allEntities = await projectEntity.getDescendants(project.entity_hierarchy_id);
    const results = await this.getResultsWithMatchType(searchString, allEntities, limit);

    const childIdToParentId = reduceToDictionary(
      await EntityRelation.find({ entity_hierarchy_id: project.entity_hierarchy_id }),
      'child_id',
      'parent_id',
    );

    const entityById = keyBy(allEntities, 'id');
    return this.formatForResponse(results, childIdToParentId, entityById);
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
    const { limit = DEFAULT_LIMIT, criteria: searchString, projectCode } = this.req.query;
    if (!searchString || searchString === '' || isNaN(parseInt(limit, 10))) {
      throw new Error('Query parameters must match "criteria" (text) and "limit" (number)');
    }
    return this.getResults(searchString, projectCode, limit);
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
