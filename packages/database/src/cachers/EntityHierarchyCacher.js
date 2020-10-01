/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { ORG_UNIT_ENTITY_TYPES } from '../modelClasses/Entity';

export class EntityHierarchyCacher {
  constructor(models) {
    this.models = models;
    this.generationsVisited = new Set();
  }

  getGenerationKey = (entities, hierarchyId) =>
    `${entities.map(e => e.code).join('-')}/${hierarchyId}`;

  async buildAndCacheAll() {
    // projects are the root entities of every full tree, so start with them
    const projects = await this.models.project.all();
    // iterate through projects in serial, as each one is quite resource intensive
    for (const project of projects) {
      await this.buildAndCacheProject(project);
    }
  }

  async buildAndCacheProject(project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    return this.fetchAndCacheDescendants(hierarchyId, { [projectEntityId]: [] });
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string} hierarchyId             The specific hierarchy to follow through entity_relation
   * @param {string} parentIdsToAncestorIds  Keys are parent ids to fetch descendants of, values are
   *                                         all ancestor ids above each parent
   */
  async fetchAndCacheDescendants(hierarchyId, parentIdsToAncestorIds) {
    const parentIds = Object.keys(parentIdsToAncestorIds);

    // check if we've reached the leaf nodes or this is already cached
    const shouldFetchAndCache = await this.checkShouldFetchAndCache(hierarchyId, parentIds);
    if (!shouldFetchAndCache) {
      return;
    }

    // check whether next generation uses entity relation links, or should fall back to parent_id
    const nextGenerationIsCanonical = await this.checkIfNextGenerationIsCanonical(
      hierarchyId,
      parentIds,
    );

    const childIdsToAncestorIds = {};
    for (const parentId of parentIds) {
      const ancestorIds = parentIdsToAncestorIds[parentId];
      const childIds = nextGenerationIsCanonical
        ? await this.getNextGenerationCanonically(parentId)
        : await this.getNextGenerationViaEntityRelation(hierarchyId, parentId);

      // if childIds is empty, we've made it to the leaf nodes
      if (childIds.length === 0) {
        continue;
      }

      // cache this generation
      const parentAndAncestorIds = [parentId, ...ancestorIds];
      await this.cacheGeneration(hierarchyId, childIds, parentAndAncestorIds);

      // add this generation to the object for caching in the next recursion
      childIds.forEach(childId => {
        childIdsToAncestorIds[childId] = parentAndAncestorIds;
      });
    }

    // keep recursing through the hierarchy
    await this.fetchAndCacheDescendants(hierarchyId, childIdsToAncestorIds);
  }

  async checkShouldFetchAndCache(hierarchyId, parentIds) {
    if (parentIds.length === 0) {
      return false; // base case of recursion, we must have reached the leaf nodes
    }

    // check whether this generation/hierarchy combo has already been cached to avoid doing it again
    // on startup, or when two projects share a hierarchy (at time of writing none do, but db schema
    // makes it possible)
    const numberAlreadyCached = await this.models.ancestorDescendantRelation.count({
      entity_hierarchy_id: hierarchyId,
      ancestor_id: parentIds,
      generational_distance: 1,
    });
    return numberAlreadyCached !== parentIds.length;
  }

  async checkIfNextGenerationIsCanonical(hierarchyId, entityIds) {
    const hierarchyLinkCount = await this.models.entityRelation.count({
      parent_id: entityIds,
      entity_hierarchy_id: hierarchyId,
    });
    // if no entity relation links, the next gen must use the canonical "parent_id" links
    return hierarchyLinkCount === 0;
  }

  async getNextGenerationCanonically(entityId) {
    const canonicalTypes = Object.values(ORG_UNIT_ENTITY_TYPES);
    const children = await this.models.entity.find(
      { parent_id: entityId, type: canonicalTypes },
      { columns: ['id'] },
    );
    return children.map(c => c.id);
  }

  async getNextGenerationViaEntityRelation(hierarchyId, entityId) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const hierarchyLinks = await this.models.entityRelation.find({
      parent_id: entityId,
      entity_hierarchy_id: hierarchyId,
    });
    return hierarchyLinks.map(l => l.child_id);
  }

  /**
   * Stores the generation of ancestor/descendant info in the database
   * @param {string} hierarchyId
   * @param {Entity[]} entityIds
   * @param {Entity[]} ancestorIds In order of generational distance, with immediate parent at index 0
   */
  async cacheGeneration(hierarchyId, entityIds, ancestorIds) {
    const records = [];
    ancestorIds.forEach((ancestorId, ancestorIndex) =>
      entityIds.forEach(entityId => {
        records.push({
          entity_hierarchy_id: hierarchyId,
          ancestor_id: ancestorId,
          descendant_id: entityId,
          generational_distance: ancestorIndex + 1,
        });
      }),
    );
    await this.models.ancestorDescendantRelation.createMany(records);
  }
}
