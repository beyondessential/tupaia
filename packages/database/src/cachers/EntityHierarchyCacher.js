/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ORG_UNIT_ENTITY_TYPES } from '../modelClasses/Entity';
import { TYPES } from '../types';
const { PROJECT, ENTITY, ENTITY_RELATION, ANCESTOR_DESCENDANT_RELATION } = TYPES;

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
    return this.recursivelyFetchAndCacheDescendants([projectEntity], hierarchyId);
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string} entityId      The entity to start at
   * @param {string} hierarchyId   The specific hierarchy to follow through entity_relation
   * @param {Entity[]} ancestors   All ancestors above this generation, for caching
   */
  async recursivelyFetchAndCacheDescendants(parents, hierarchyId, ancestors = []) {
    // check whether this generation/hierarchy combo has already been cached to avoid doing it again
    // on startup, or when two projects share a hierarchy (at time of writing none do, but db schema
    // makes it possible)
    const alreadyCached =
      (await this.database.count(ANCESTOR_DESCENDANT_RELATION, {
        ancestor_id: parents.map(p => p.id),
        hierarchy_id: hierarchyId,
      })) === parents.length;
    if (alreadyCached) {
      return;
    }

    // get the next generation of entities
    const children = await this.getNextGeneration(parents, hierarchyId);

    // if children is empty, we've made it to the leaf nodes
    if (children.length === 0) {
      return;
    }

    // cache this generation
    await this.cacheGeneration(hierarchyId, children, ancestors);

    // keep recursing through the hierarchy
    await this.recursivelyFetchAndCacheDescendants(children, hierarchyId, [
      ...ancestors,
      ...children,
    ]);

  async getNextGeneration(parents, hierarchyId) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const parentIds = parents.map(p => p.id);
    const hierarchyLinks = hierarchyId
      ? await this.database.find(ENTITY_RELATION, {
          parent_id: parentIds,
          entity_hierarchy_id: hierarchyId,
        })
      : [];
    const childIds = hierarchyLinks.map(l => l.child_id);

    if (childIds.length > 0) {
      return this.database.find(ENTITY, { id: childIds });
    }

    // no hierarchy specific relations, get next generation following canonical relationships
    const canonicalTypes = Object.values(ORG_UNIT_ENTITY_TYPES);
    return this.database.find(
      ENTITY,
      { parent_id: parentIds, type: canonicalTypes },
      { columns: ['id', 'code', 'type'] },
    );
  }

  async cacheGeneration(hierarchyId, entitiesOfGeneration, ancestors) {
    const records = [];
    ancestors.forEach(ancestor =>
      entitiesOfGeneration.forEach(entity => {
        records.push({
          hierarchy_id: hierarchyId,
          ancestor_id: ancestor.id,
          ancestor_code: ancestor.code,
          ancestor_type: ancestor.type,
          descendant_id: entity.id,
          descendant_code: entity.code,
          descendant_type: entity.type,
        });
      }),
    );
    await this.database.createMany(ANCESTOR_DESCENDANT_RELATION, records);
  }
}
