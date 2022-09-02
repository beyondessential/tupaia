/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { reduceToDictionary } from '@tupaia/utils';
import winston from 'winston';
import { ORG_UNIT_ENTITY_TYPES } from '../modelClasses/Entity';
import { ChangeHandler } from './ChangeHandler';

export class EntityHierarchyCacher extends ChangeHandler {
  constructor(models) {
    super(models, 'entity-hierarchy-cacher');

    this.changeTranslators = {
      entity: change => this.translateEntityChangeToRebuildJobs(change),
      entityRelation: change => this.translateEntityRelationChangeToRebuildJobs(change),
      entityHierarchy: change => this.translateEntityHierarchyChangeToRebuildJobs(change),
    };
  }

  async translateEntityChangeToRebuildJobs({ record_id: entityId }) {
    // if entity was deleted or created, or parent_id has changed, we need to delete subtrees and
    // rebuild all hierarchies
    const hierarchies = await this.models.entityHierarchy.all();
    const jobs = hierarchies.map(({ id: hierarchyId }) => ({
      hierarchyId,
      rootEntityId: entityId,
    }));
    return jobs;
  }

  translateEntityRelationChangeToRebuildJobs({ old_record: oldRecord, new_record: newRecord }) {
    // delete and rebuild subtree from both old and new record, in case hierarchy and/or parent_id
    // have changed
    const jobs = [oldRecord, newRecord]
      .filter(r => r)
      .map(r => ({ hierarchyId: r.entity_hierarchy_id, rootEntityId: r.parent_id }));
    return jobs;
  }

  async translateEntityHierarchyChangeToRebuildJobs({
    record_id: hierarchyId,
    old_record: oldRecord,
    new_record: newRecord,
  }) {
    if (oldRecord && newRecord) {
      if (oldRecord.canonical_types === newRecord.canonical_types) {
        return null; // if the canonical types are the same, the change won't invalidate the cache
      }
    }
    const projectsUsingHierarchy = await this.models.project.find({
      entity_hierarchy_id: hierarchyId,
    });
    // delete and rebuild full hierarchy of any project using this entity
    const jobs = projectsUsingHierarchy.map(p => ({ hierarchyId, rootEntityId: p.entity_id }));
    return jobs;
  }

  async handleChanges(transactingModels, rebuildJobs) {
    // get the subtrees to delete, then run the delete
    const subtreesForDelete = {};
    const start = Date.now();
    rebuildJobs.forEach(({ hierarchyId, rootEntityId }) => {
      if (!subtreesForDelete[hierarchyId]) {
        subtreesForDelete[hierarchyId] = new Set();
      }
      subtreesForDelete[hierarchyId].add(rootEntityId);
    });
    const deletes = Object.entries(subtreesForDelete).map(async ([hierarchyId, rootEntityIds]) =>
      this.deleteSubtrees(transactingModels, hierarchyId, [...rootEntityIds]),
    );
    await Promise.all(deletes);

    // get the unique set of hierarchies to be rebuilt, then run the rebuild
    const hierarchiesForRebuild = Object.keys(subtreesForDelete);
    await this.buildAndCacheHierarchies(transactingModels, hierarchiesForRebuild);
    const end = Date.now();
    winston.info(`Rebuilding entity hierarchy cache took: ${end - start}ms`);
  }

  async deleteSubtrees(transactingModels, hierarchyId, rootEntityIds) {
    const descendantRelations = await transactingModels.ancestorDescendantRelation.find({
      ancestor_id: rootEntityIds,
      entity_hierarchy_id: hierarchyId,
    });
    const entityIdsForDelete = [...rootEntityIds, ...descendantRelations.map(r => r.descendant_id)];
    await transactingModels.database.executeSqlInBatches(entityIdsForDelete, batchOfEntityIds => [
      `
        DELETE FROM ancestor_descendant_relation
        WHERE
          entity_hierarchy_id = ?
        AND
          descendant_id IN (${batchOfEntityIds.map(() => '?').join(',')});
      `,
      [hierarchyId, ...batchOfEntityIds],
    ]);
  }

  /**
   * @param {string[]} hierarchyIds The specific hierarchies to cache (defaults to all)
   */
  async buildAndCacheHierarchies(transactingModels, hierarchyIds) {
    // projects are the root entities of every full tree, so start with them
    const projectCriteria = hierarchyIds ? { entity_hierarchy_id: hierarchyIds } : {};
    const projects = await transactingModels.project.find(projectCriteria);
    const projectTasks = projects.map(async project =>
      this.buildAndCacheProject(transactingModels, project),
    );
    await Promise.all(projectTasks);
  }

  async buildAndCacheProject(transactingModels, project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    return this.fetchAndCacheDescendants(transactingModels, hierarchyId, { [projectEntityId]: [] });
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string} hierarchyId             The specific hierarchy to follow through entity_relation
   * @param {string} parentIdsToAncestorIds  Keys are parent ids to fetch descendants of, values are
   *                                         all ancestor ids above each parent
   */
  async fetchAndCacheDescendants(transactingModels, hierarchyId, parentIdsToAncestorIds) {
    const parentIds = Object.keys(parentIdsToAncestorIds);

    // check whether next generation uses entity relation links, or should fall back to parent_id
    const entityRelationChildCount = await this.countEntityRelationChildren(
      transactingModels,
      hierarchyId,
      parentIds,
    );
    const useEntityRelationLinks = entityRelationChildCount > 0;
    const childCount = useEntityRelationLinks
      ? entityRelationChildCount
      : await this.countCanonicalChildren(transactingModels, hierarchyId, parentIds);

    if (childCount === 0) {
      return; // at a leaf node generation, no need to go any further
    }

    const childIdToAncestorIds = await this.fetchChildIdToAncestorIds(
      transactingModels,
      hierarchyId,
      parentIdsToAncestorIds,
      useEntityRelationLinks,
    );

    await this.cacheGeneration(transactingModels, hierarchyId, childIdToAncestorIds);

    // if there is another generation, keep recursing through the hierarchy
    await this.fetchAndCacheDescendants(transactingModels, hierarchyId, childIdToAncestorIds);
  }

  async fetchChildIdToAncestorIds(
    transactingModels,
    hierarchyId,
    parentIdsToAncestorIds,
    useEntityRelationLinks,
  ) {
    const parentIds = Object.keys(parentIdsToAncestorIds);
    const relations = useEntityRelationLinks
      ? await this.getRelationsViaEntityRelation(transactingModels, hierarchyId, parentIds)
      : await this.getRelationsCanonically(transactingModels, hierarchyId, parentIds);
    const childIdToParentId = reduceToDictionary(relations, 'child_id', 'parent_id');
    const childIdToAncestorIds = Object.fromEntries(
      Object.entries(childIdToParentId).map(([childId, parentId]) => [
        childId,
        [parentId, ...parentIdsToAncestorIds[parentId]],
      ]),
    );
    return childIdToAncestorIds;
  }

  getEntityRelationChildrenCriteria(hierarchyId, parentIds) {
    return {
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    };
  }

  async countEntityRelationChildren(transactingModels, hierarchyId, parentIds) {
    const criteria = this.getEntityRelationChildrenCriteria(hierarchyId, parentIds);
    return transactingModels.entityRelation.count(criteria);
  }

  async getRelationsViaEntityRelation(transactingModels, hierarchyId, parentIds) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const criteria = this.getEntityRelationChildrenCriteria(hierarchyId, parentIds);
    return transactingModels.entityRelation.find(criteria);
  }

  async getCanonicalChildrenCriteria(transactingModels, hierarchyId, parentIds) {
    // Only include entities of types that are considered canonical, either using a custom set of
    // canonical types defined by the hierarchy, or the default, which is org unit types.
    const entityHierarchy = await transactingModels.entityHierarchy.findById(hierarchyId);
    const { canonical_types: customCanonicalTypes } = entityHierarchy;
    const canonicalTypes =
      customCanonicalTypes && customCanonicalTypes.length > 0
        ? customCanonicalTypes
        : Object.values(ORG_UNIT_ENTITY_TYPES);
    return {
      parent_id: parentIds,
      type: canonicalTypes,
    };
  }

  async countCanonicalChildren(transactingModels, hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(
      transactingModels,
      hierarchyId,
      parentIds,
    );
    return transactingModels.entity.count(criteria);
  }

  async getRelationsCanonically(transactingModels, hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(
      transactingModels,
      hierarchyId,
      parentIds,
    );
    const children = await transactingModels.entity.find(criteria, {
      columns: ['id', 'parent_id'],
    });
    return children.map(c => ({ child_id: c.id, parent_id: c.parent_id }));
  }

  /**
   * Stores the generation of ancestor/descendant info in the database
   * @param {string} hierarchyId
   * @param {Entity[]} childIdToAncestorIds   Ids of the child entities as keys, with the ids of their
   *                                          ancestors in order of generational distance, with immediate
   *                                          parent at index 0
   */
  async cacheGeneration(transactingModels, hierarchyId, childIdToAncestorIds) {
    const records = [];
    const childIds = Object.keys(childIdToAncestorIds);
    const existingParentRelations = await transactingModels.ancestorDescendantRelation.find({
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
    await transactingModels.ancestorDescendantRelation.createMany(records);
  }
}
