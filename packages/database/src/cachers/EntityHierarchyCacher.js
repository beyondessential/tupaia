/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { AsyncTaskQueue } from '@tupaia/utils';
import { ORG_UNIT_ENTITY_TYPES } from '../modelClasses/Entity';

const BATCH_SIZE = 5;

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

    // check whether next generation uses entity relation links, or should fall back to parent_id
    const entityRelationChildCount = await this.countEntityRelationChildren(hierarchyId, parentIds);
    const useEntityRelationLinks = entityRelationChildCount > 0;
    const childCount = useEntityRelationLinks
      ? entityRelationChildCount
      : await this.countCanonicalChildren(parentIds);

    if (childCount === 0) {
      return; // at a leaf node generation, no need to go any further
    }

    const childIdsToAncestorIds = await this.fetchChildIdsToAncestorIds(
      hierarchyId,
      parentIdsToAncestorIds,
      useEntityRelationLinks,
    );

    const childrenAlreadyCached = await this.checkChildrenAlreadyCached(
      hierarchyId,
      parentIds,
      childCount,
    );
    if (!childrenAlreadyCached) {
      await this.cacheGeneration(hierarchyId, childIdsToAncestorIds);
    }

    // if there is another generation, keep recursing through the hierarchy
    await this.fetchAndCacheDescendants(
      hierarchyId,
      childIdsToAncestorIds,
      entityRelationChildCount === 0,
    );
  }

  async checkChildrenAlreadyCached(hierarchyId, parentIds, childCount) {
    const numberChildrenCached = await this.models.ancestorDescendantRelation.count({
      entity_hierarchy_id: hierarchyId,
      ancestor_id: parentIds,
      generational_distance: 1,
    });
    return numberChildrenCached === childCount;
  }

  async fetchChildIdsToAncestorIds(hierarchyId, parentIdsToAncestorIds, useEntityRelationLinks) {
    const parentIds = Object.keys(parentIdsToAncestorIds);

    const childIdsToAncestorIds = {};
    const taskQueue = new AsyncTaskQueue(BATCH_SIZE);
    const tasks = parentIds.map(parentId =>
      taskQueue.add(async () => {
        const ancestorIds = parentIdsToAncestorIds[parentId];
        const childIds = useEntityRelationLinks
          ? await this.getNextGenerationViaEntityRelation(hierarchyId, parentId)
          : await this.getNextGenerationCanonically(parentId);

        // if childIds is empty, this is a leaf node
        if (childIds.length === 0) {
          return;
        }

        // add this generation to the object for caching
        const parentAndAncestorIds = [parentId, ...ancestorIds];
        childIds.forEach(childId => {
          childIdsToAncestorIds[childId] = parentAndAncestorIds;
        });
      }),
    );
    await Promise.all(tasks);

    return childIdsToAncestorIds;
  }

  async countEntityRelationChildren(hierarchyId, entityIds) {
    return this.models.entityRelation.count({
      parent_id: entityIds,
      entity_hierarchy_id: hierarchyId,
    });
  }

  async countCanonicalChildren(entityIds) {
    const canonicalTypes = Object.values(ORG_UNIT_ENTITY_TYPES);
    return this.models.entity.count({
      parent_id: entityIds,
      type: canonicalTypes,
    });
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
   * @param {Entity[]} childIdsToAncestorIds  Ids of the child entities as keys, with the ids of their
   *                                          ancestors in order of generational distance, with immediate
   *                                          parent at index 0
   */
  async cacheGeneration(hierarchyId, childIdsToAncestorIds) {
    const records = [];
    Object.entries(childIdsToAncestorIds).forEach(([childId, ancestorIds]) => {
      ancestorIds.forEach((ancestorId, ancestorIndex) =>
        records.push({
          entity_hierarchy_id: hierarchyId,
          ancestor_id: ancestorId,
          descendant_id: childId,
          generational_distance: ancestorIndex + 1,
        }),
      );
    });
    await this.models.ancestorDescendantRelation.createMany(records);
  }
}
