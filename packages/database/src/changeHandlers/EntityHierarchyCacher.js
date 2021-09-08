/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { reduceToDictionary } from '@tupaia/utils';
import { ORG_UNIT_ENTITY_TYPES } from '../modelClasses/Entity';

const REBUILD_DEBOUNCE_TIME = 1000; // wait 1 second after changes before rebuilding, to avoid double-up

export class EntityHierarchyCacher {
  constructor(models) {
    this.models = models;
    this.changeHandlerCancellers = [];
    this.scheduledRebuildJobs = [];
    this.scheduledRebuildTimeout = null;
  }

  listenForChanges() {
    this.changeHandlerCancellers = [
      this.models.entity.addChangeHandler(this.handleEntityChange),
      this.models.entityRelation.addChangeHandler(this.handleEntityRelationChange),
      this.models.entityHierarchy.addChangeHandler(this.handleEntityHierarchyChange),
    ];
  }

  stopListeningForChanges() {
    this.changeHandlerCancellers.forEach(c => c());
    this.changeHandlerCancellers = [];
  }

  handleEntityChange = async ({ record_id: entityId }) => {
    // if entity was deleted or created, or parent_id has changed, we need to delete subtrees and
    // rebuild all hierarchies
    const hierarchies = await this.models.entityHierarchy.all();
    const hierarchyTasks = hierarchies.map(async ({ id: hierarchyId }) => {
      return this.scheduleRebuildOfSubtree(hierarchyId, entityId);
    });
    await Promise.all(hierarchyTasks);
  };

  handleEntityRelationChange = async ({ old_record: oldRecord, new_record: newRecord }) => {
    // delete and rebuild subtree from both old and new record, in case hierarchy and/or parent_id
    // have changed
    const tasks = [oldRecord, newRecord]
      .filter(r => r)
      .map(r => this.scheduleRebuildOfSubtree(r.entity_hierarchy_id, r.parent_id));
    return Promise.all(tasks);
  };

  handleEntityHierarchyChange = async ({
    record_id: hierarchyId,
    old_record: oldRecord,
    new_record: newRecord,
  }) => {
    if (oldRecord && newRecord) {
      if (oldRecord.canonical_types === newRecord.canonical_types) {
        return null; // if the canonical types are the same, the change won't invalidate the cache
      }
    }
    const projectsUsingHierarchy = await this.models.project.find({
      entity_hierarchy_id: hierarchyId,
    });
    // delete and rebuild full hierarchy of any project using this entity
    const tasks = projectsUsingHierarchy.map(p =>
      this.scheduleRebuildOfSubtree(hierarchyId, p.entity_id),
    );
    return Promise.all(tasks);
  };

  // add the hierarchy to the list to be rebuilt, with a debounce so that we don't rebuild
  // many times for a bulk lot of changes
  scheduleRebuildOfSubtree(hierarchyId, rootEntityId) {
    const promiseForJob = new Promise(resolve => {
      this.scheduledRebuildJobs.push({ hierarchyId, rootEntityId, resolve });
    });

    // clear any previous scheduled rebuild, so that we debounce all changes in the same time period
    if (this.scheduledRebuildTimeout) {
      clearTimeout(this.scheduledRebuildTimeout);
    }

    // schedule the rebuild to happen after an adequate period of debouncing
    this.scheduledRebuildTimeout = setTimeout(this.runScheduledRebuild, REBUILD_DEBOUNCE_TIME);

    // return the promise for the caller to await
    return promiseForJob;
  }

  runScheduledRebuild = async () => {
    // remove timeout so any jobs added now get scheduled anew
    this.scheduledRebuildTimeout = null;

    // retrieve the current set of jobs
    const jobs = this.scheduledRebuildJobs;
    this.scheduledRebuildJobs = [];

    // get the subtrees to delete, then run the delete
    const subtreesForDelete = {};
    jobs.forEach(({ hierarchyId, rootEntityId }) => {
      if (!subtreesForDelete[hierarchyId]) {
        subtreesForDelete[hierarchyId] = new Set();
      }
      subtreesForDelete[hierarchyId].add(rootEntityId);
    });
    const deleteTasks = Object.entries(
      subtreesForDelete,
    ).map(async ([hierarchyId, rootEntityIds]) =>
      this.deleteSubtrees(hierarchyId, [...rootEntityIds]),
    );
    await Promise.all(deleteTasks);

    // get the unique set of hierarchies to be rebuilt, then run the rebuild
    const hierarchiesForRebuild = Object.keys(subtreesForDelete);
    await this.buildAndCacheHierarchies(hierarchiesForRebuild);

    // resolve all jobs
    jobs.forEach(j => j.resolve());
  };

  async deleteSubtrees(hierarchyId, rootEntityIds) {
    const descendantRelations = await this.models.ancestorDescendantRelation.find({
      ancestor_id: rootEntityIds,
      entity_hierarchy_id: hierarchyId,
    });
    const entityIdsForDelete = [...rootEntityIds, ...descendantRelations.map(r => r.descendant_id)];
    await this.models.database.executeSqlInBatches(entityIdsForDelete, batchOfEntityIds => [
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
   * @param {[string[]]} hierarchyIds The specific hierarchies to cache (defaults to all)
   */
  async buildAndCacheHierarchies(hierarchyIds) {
    // projects are the root entities of every full tree, so start with them
    const projectCriteria = hierarchyIds ? { entity_hierarchy_id: hierarchyIds } : {};
    const projects = await this.models.project.find(projectCriteria);
    const projectTasks = projects.map(async project => this.buildAndCacheProject(project));
    await Promise.all(projectTasks);
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
      : await this.countCanonicalChildren(hierarchyId, parentIds);

    if (childCount === 0) {
      return; // at a leaf node generation, no need to go any further
    }

    const childIdToAncestorIds = await this.fetchChildIdToAncestorIds(
      hierarchyId,
      parentIdsToAncestorIds,
      useEntityRelationLinks,
    );

    await this.cacheGeneration(hierarchyId, childIdToAncestorIds);

    // if there is another generation, keep recursing through the hierarchy
    await this.fetchAndCacheDescendants(hierarchyId, childIdToAncestorIds);
  }

  async fetchChildIdToAncestorIds(hierarchyId, parentIdsToAncestorIds, useEntityRelationLinks) {
    const parentIds = Object.keys(parentIdsToAncestorIds);
    const relations = useEntityRelationLinks
      ? await this.getRelationsViaEntityRelation(hierarchyId, parentIds)
      : await this.getRelationsCanonically(hierarchyId, parentIds);
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

  async countEntityRelationChildren(hierarchyId, parentIds) {
    const criteria = this.getEntityRelationChildrenCriteria(hierarchyId, parentIds);
    return this.models.entityRelation.count(criteria);
  }

  async getRelationsViaEntityRelation(hierarchyId, parentIds) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const criteria = this.getEntityRelationChildrenCriteria(hierarchyId, parentIds);
    return this.models.entityRelation.find(criteria);
  }

  async getCanonicalChildrenCriteria(hierarchyId, parentIds) {
    // Only include entities of types that are considered canonical, either using a custom set of
    // canonical types defined by the hierarchy, or the default, which is org unit types.
    const entityHierarchy = await this.models.entityHierarchy.findById(hierarchyId);
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

  async countCanonicalChildren(hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(hierarchyId, parentIds);
    return this.models.entity.count(criteria);
  }

  async getRelationsCanonically(hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(hierarchyId, parentIds);
    const children = await this.models.entity.find(criteria, { columns: ['id', 'parent_id'] });
    return children.map(c => ({ child_id: c.id, parent_id: c.parent_id }));
  }

  /**
   * Stores the generation of ancestor/descendant info in the database
   * @param {string} hierarchyId
   * @param {Entity[]} childIdToAncestorIds   Ids of the child entities as keys, with the ids of their
   *                                          ancestors in order of generational distance, with immediate
   *                                          parent at index 0
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
