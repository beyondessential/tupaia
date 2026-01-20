/**
 * @typedef {import('@tupaia/types').AncestorDescendantRelation} AncestorDescendantRelation
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('../../../core/modelClasses/EntityParentChildRelation').EntityParentChildRelationRecord} EntityParentChildRelationRecord
 */

import { reduceToDictionary } from '@tupaia/utils';
import { EntityParentChildRelationBuilder } from './EntityParentChildRelationBuilder';
import { SqlQuery } from '../../../core';

export class EntityHierarchySubtreeRebuilder {
  constructor(models) {
    this.models = models;
    this.entityParentChildRelationBuilder = new EntityParentChildRelationBuilder(models);
  }

  /**
   * @public
   * Rebuilds subtrees listed in the rebuild jobs
   * @param {{hierarchyId: string; rootEntityId: string}[]} rebuildJobs
   * @returns {Promise<Entity['id'][]>}
   */
  async rebuildSubtrees(rebuildJobs) {
    // rebuild the entity parent child relations first so
    // that the subtree rebuilds are based on the most up to date relations
    const relatedEntityIds =
      await this.entityParentChildRelationBuilder.rebuildRelations(rebuildJobs);

    // get the subtrees to delete, then run the delete
    const subtreesForDelete = {};
    /** @type {Record<EntityHierarchy['id'], Set<Entity['id']>>} */
    rebuildJobs.forEach(({ hierarchyId, rootEntityId }) => {
      if (!subtreesForDelete[hierarchyId]) {
        subtreesForDelete[hierarchyId] = new Set();
      }
      subtreesForDelete[hierarchyId].add(rootEntityId);
    });
    const deletes = Object.entries(subtreesForDelete).map(async ([hierarchyId, rootEntityIds]) =>
      this.deleteSubtrees(hierarchyId, [...rootEntityIds]),
    );
    await Promise.all(deletes);

    // get the unique set of hierarchies to be rebuilt, then run the rebuild
    const hierarchiesForRebuild = Object.keys(subtreesForDelete);
    await this.buildAndCacheHierarchies(hierarchiesForRebuild);

    return relatedEntityIds;
  }

  /**
   * @private
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} rootEntityIds
   */
  async deleteSubtrees(hierarchyId, rootEntityIds) {
    const descendantRelations = await this.models.ancestorDescendantRelation.find({
      ancestor_id: rootEntityIds,
      entity_hierarchy_id: hierarchyId,
    });
    const entityIdsForDelete = [...rootEntityIds, ...descendantRelations.map(r => r.descendant_id)];
    await this.models.database.executeSqlInBatches(entityIdsForDelete, batchOfEntityIds => [
      `
        DELETE FROM ancestor_descendant_relation
        WHERE entity_hierarchy_id = ?
        AND descendant_id IN ${SqlQuery.record(batchOfEntityIds)};
      `,
      [hierarchyId, ...batchOfEntityIds],
    ]);
  }

  /**
   * @public
   * @param {string[]} hierarchyIds The specific hierarchies to cache (defaults to all)
   */
  async buildAndCacheHierarchies(hierarchyIds) {
    // projects are the root entities of every full tree, so start with them
    const projectCriteria = hierarchyIds ? { entity_hierarchy_id: hierarchyIds } : {};
    const projects = await this.models.project.find(projectCriteria);
    const projectTasks = projects.map(async project => this.buildAndCacheProject(project));
    await Promise.all(projectTasks);
  }

  /**
   * @public
   */
  async buildAndCacheProject(project) {
    await this.entityParentChildRelationBuilder.rebuildRelationsForProject(project);
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    return this.fetchAndCacheDescendants(hierarchyId, { [projectEntityId]: [] });
  }

  /**
   * @private
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {EntityHierarchy['id']} hierarchyId The specific hierarchy to follow through
   * `entity_relation`
   * @param {Record<Entity['id'], Entity['id'][]>} parentIdsToAncestorIds Keys are parent IDs to
   * fetch descendants of, values are all ancestor ids above each parent
   */
  async fetchAndCacheDescendants(hierarchyId, parentIdsToAncestorIds) {
    const parentIds = Object.keys(parentIdsToAncestorIds);
    const childCount = await this.countChildren(hierarchyId, parentIds);

    if (childCount === 0) {
      return; // at a leaf node generation, no need to go any further
    }

    const childIdToAncestorIds = await this.fetchChildIdToAncestorIds(
      hierarchyId,
      parentIdsToAncestorIds,
    );

    await this.cacheGeneration(hierarchyId, childIdToAncestorIds);

    // if there is another generation, keep recursing through the hierarchy
    await this.fetchAndCacheDescendants(hierarchyId, childIdToAncestorIds);
  }

  /**
   * @private
   */
  async fetchChildIdToAncestorIds(hierarchyId, parentIdsToAncestorIds) {
    const parentIds = Object.keys(parentIdsToAncestorIds);
    const relations = await this.getChildRelations(hierarchyId, parentIds);
    const childIdToParentId = reduceToDictionary(relations, 'child_id', 'parent_id');
    const childIdToAncestorIds = Object.fromEntries(
      Object.entries(childIdToParentId).map(([childId, parentId]) => [
        childId,
        [parentId, ...parentIdsToAncestorIds[parentId]],
      ]),
    );
    return childIdToAncestorIds;
  }

  /**
   * @private
   */
  async countChildren(hierarchyId, parentIds) {
    const criteria = this.getChildRelationsCriteria(hierarchyId, parentIds);
    return this.models.entityParentChildRelation.count(criteria);
  }

  /**
   * @private
   * @template HierarchyId
   * @template ParentId
   * @param {HierarchyId} hierarchyId
   * @param {ParentId[]} parentIds
   * @returns {{parent_id: ParentId[], entity_hierarchy_id: HierarchyId}}
   */
  getChildRelationsCriteria(hierarchyId, parentIds) {
    return {
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    };
  }

  /**
   * @private
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} parentIds
   * @returns {Promise<EntityParentChildRelationRecord[]>}
   */
  async getChildRelations(hierarchyId, parentIds) {
    // get any matching relationships leading out of these parents for the hierarchy
    const criteria = this.getChildRelationsCriteria(hierarchyId, parentIds);
    return this.models.entityParentChildRelation.find(criteria);
  }

  /**
   * @private
   * Stores the generation of ancestor/descendant info in the database
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Record<Entity['id'], Entity['id'][]>} childIdToAncestorIds IDs of the child entities as
   * keys, with the IDs of their ancestors in order of generational distance, with immediate parent
   * at index 0
   */
  async cacheGeneration(hierarchyId, childIdToAncestorIds) {
    const records = [];
    const childIds = Object.keys(childIdToAncestorIds);
    const existingParentRelations = await this.models.ancestorDescendantRelation.find({
      descendant_id: childIds,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
    const childrenAlreadyCached = new Set(existingParentRelations.map(r => r.descendant_id));
    Object.entries(childIdToAncestorIds)
      .filter(([childId]) => !childrenAlreadyCached.has(childId))
      .forEach(([childId, ancestorIds]) => {
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
