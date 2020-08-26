/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { AsyncTaskQueue } from '@tupaia/utils';
import { ORG_UNIT_ENTITY_TYPES } from '../modelClasses/Entity';
import { TYPES } from '../types';
const { PROJECT, ENTITY, ENTITY_RELATION, ANCESTOR_DESCENDANT_RELATION } = TYPES;
const BATCH_SIZE = 1;

export class EntityHierarchyCacher {
  constructor(database) {
    this.database = database;
    this.generationsVisited = new Set();
  }

  getGenerationKey = (entities, hierarchyId) =>
    `${entities.map(e => e.code).join('-')}/${hierarchyId}`;

  async buildAndCacheAll() {
    // projects are the root entities of every full tree, so start with them
    const projects = await this.database.find(PROJECT);
    // iterate through projects in serial, as each one is quite resource intensive
    for (let i = 0; i < projects.length; i++) {
      const project = projects[i];
      await this.buildAndCacheProject(project);
    }
  }

  async buildAndCacheProject(project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    const projectEntity = await this.database.findOne(ENTITY, { id: projectEntityId });
    return this.recursivelyFetchAndCacheDescendants(hierarchyId, projectEntity);
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string} hierarchyId   The specific hierarchy to follow through entity_relation
   * @param {string} parent        The entity to start at
   * @param {Entity[]} ancestors   All ancestors above this parent, for caching
   */
  async recursivelyFetchAndCacheDescendants(hierarchyId, parent, ancestors = []) {
    // check whether this generation/hierarchy combo has already been cached to avoid doing it again
    // on startup, or when two projects share a hierarchy (at time of writing none do, but db schema
    // makes it possible)
    const alreadyCached = !!(await this.database.findOne(ANCESTOR_DESCENDANT_RELATION, {
      hierarchy_id: hierarchyId,
      ancestor_id: parent.id,
    }));
    if (alreadyCached) {
      return;
    }

    // get the next generation of entities
    const children = await this.getNextGeneration(hierarchyId, parent.id);

    // if children is empty, we've made it to the leaf nodes
    if (children.length === 0) {
      return;
    }

    // cache this generation
    const parentAndAncestors = [parent, ...ancestors];
    await this.cacheGeneration(hierarchyId, children, parentAndAncestors);

    // keep recursing through the hierarchy
    const taskQueue = new AsyncTaskQueue(BATCH_SIZE);
    const childTasks = children.map(child =>
      taskQueue.add(() =>
        this.recursivelyFetchAndCacheDescendants(hierarchyId, child, parentAndAncestors),
      ),
    );
    await Promise.all(childTasks);
  }

  async getNextGeneration(hierarchyId, entityId) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const hierarchyLinks = await this.database.find(ENTITY_RELATION, {
      parent_id: entityId,
      entity_hierarchy_id: hierarchyId,
    });
    const childIds = hierarchyLinks.map(l => l.child_id);

    if (childIds.length > 0) {
      return this.database.find(ENTITY, { id: childIds });
    }

    // no hierarchy specific relations, get next generation following canonical relationships
    const canonicalTypes = Object.values(ORG_UNIT_ENTITY_TYPES);
    return this.database.find(
      ENTITY,
      { parent_id: entityId, type: canonicalTypes },
      { columns: ['id', 'code', 'type', 'name'] },
    );
  }

  /**
   * Stores the generation of ancestor/descendant info in the database
   * @param {string} hierarchyId
   * @param {Entity[]} entitiesOfGeneration
   * @param {Entity[]} ancestors In order of generational distance, with immediate parent at index 0
   */
  async cacheGeneration(hierarchyId, entitiesOfGeneration, ancestors) {
    const records = [];
    ancestors.forEach((ancestor, ancestorIndex) =>
      entitiesOfGeneration.forEach(entity => {
        records.push({
          hierarchy_id: hierarchyId,
          ancestor_id: ancestor.id,
          ancestor_code: ancestor.code,
          ancestor_type: ancestor.type,
          ancestor_name: ancestor.name,
          descendant_id: entity.id,
          descendant_code: entity.code,
          descendant_type: entity.type,
          generational_distance: ancestorIndex + 1,
        });
      }),
    );
    await this.database.createMany(ANCESTOR_DESCENDANT_RELATION, records);
  }
}
