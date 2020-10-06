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
    this.resetScheduledHierarchyRebuild();
  }

  listenForChanges() {
    this.changeHandlerCancellers[0] = this.models.entity.addChangeHandler(this.handleEntityChange);
    this.changeHandlerCancellers[1] = this.models.entityRelation.addChangeHandler(
      this.handleEntityRelationChange,
    );
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
      await this.deleteSubtree(hierarchyId, entityId);
      return this.scheduleHierarchyForRebuild(hierarchyId);
    });
    await Promise.all(hierarchyTasks);
  };

  handleEntityRelationChange = async ({ record }) => {
    // delete subtree from child_id onwards within the associated hierarchy, and kick off a new build
    // of any projects associated with changed hierarchies
    const { entity_hierarchy_id: hierarchyId, child_id: childId } = record;
    await this.deleteSubtree(hierarchyId, childId);
    return this.scheduleHierarchyForRebuild(hierarchyId);
  };

  resetScheduledHierarchyRebuild() {
    this.hierarchiesForRebuild = new Set();
    this.scheduledRebuildPromise = null;
    this.resolveScheduledRebuild = null;
    this.scheduledRebuildTimeout = null;
  }

  // add the hierarchy to the list to be rebuilt, with a debounce so that we don't rebuild
  // many times for a bulk lot of changes
  scheduleHierarchyForRebuild(hierarchyId) {
    this.hierarchiesForRebuild.add(hierarchyId);

    // clear any previous scheduled rebuild, so that we debounce all changes in the same time period
    if (this.scheduledRebuildTimeout) {
      clearTimeout(this.scheduledRebuildTimeout);
    }

    // set up a promise that will complete when the rebuild has happened, even if that is after
    // several other changes have been added after debouncing
    if (!this.scheduledRebuildPromise) {
      this.scheduledRebuildPromise = new Promise(resolve => {
        this.resolveScheduledRebuild = () => {
          this.resetScheduledHierarchyRebuild();
          resolve();
        };
      });
    }

    // schedule the rebuild to happen after an adequate period of debouncing
    this.scheduledRebuildTimeout = setTimeout(async () => {
      await this.buildAndCacheHierarchies([...this.hierarchiesForRebuild]);
      this.resolveScheduledRebuild();
    }, REBUILD_DEBOUNCE_TIME);

    // return the promise for the caller to await
    return this.scheduledRebuildPromise;
  }

  async deleteSubtree(hierarchyId, rootEntityId) {
    const descendantRelations = await this.models.ancestorDescendantRelation.find({
      ancestor_id: rootEntityId,
      entity_hierarchy_id: hierarchyId,
    });
    const entityIdsForDelete = [rootEntityId, ...descendantRelations.map(r => r.descendant_id)];
    await this.models.database.executeSqlInBatches(entityIdsForDelete, batchOfEntityIds => [
      `
        DELETE FROM ancestor_descendant_relation
        WHERE
          entity_hierarchy_id = ?
        AND (
            ancestor_id IN (${batchOfEntityIds.map(() => '?').join(',')})
          OR
            descendant_id IN (${batchOfEntityIds.map(() => '?').join(',')})
        );
      `,
      [hierarchyId, ...batchOfEntityIds, ...batchOfEntityIds],
    ]);
    await this.models.ancestorDescendantRelation.delete({
      descendant_id: entityIdsForDelete,
      entity_hierarchy_id: hierarchyId,
    });
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
      : await this.countCanonicalChildren(parentIds);

    if (childCount === 0) {
      return; // at a leaf node generation, no need to go any further
    }

    const childIdToAncestorIds = await this.fetchChildIdToAncestorIds(
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
      await this.cacheGeneration(hierarchyId, childIdToAncestorIds);
    }

    // if there is another generation, keep recursing through the hierarchy
    await this.fetchAndCacheDescendants(hierarchyId, childIdToAncestorIds);
  }

  async checkChildrenAlreadyCached(hierarchyId, parentIds, childCount) {
    const numberChildrenCached = await this.models.ancestorDescendantRelation.count({
      entity_hierarchy_id: hierarchyId,
      ancestor_id: parentIds,
      generational_distance: 1,
    });
    return numberChildrenCached === childCount;
  }

  async fetchChildIdToAncestorIds(hierarchyId, parentIdsToAncestorIds, useEntityRelationLinks) {
    const parentIds = Object.keys(parentIdsToAncestorIds);
    const relations = useEntityRelationLinks
      ? await this.getRelationsViaEntityRelation(hierarchyId, parentIds)
      : await this.getRelationsCanonically(parentIds);
    const childIdToParentId = reduceToDictionary(relations, 'child_id', 'parent_id');
    const childIdToAncestorIds = Object.fromEntries(
      Object.entries(childIdToParentId).map(([childId, parentId]) => [
        childId,
        [parentId, ...parentIdsToAncestorIds[parentId]],
      ]),
    );
    return childIdToAncestorIds;
  }

  async countEntityRelationChildren(hierarchyId, entityIds) {
    return this.models.entityRelation.count({
      parent_id: entityIds,
      entity_hierarchy_id: hierarchyId,
    });
  }

  getCanonicalChildrenCriteria(parentIds) {
    const canonicalTypes = Object.values(ORG_UNIT_ENTITY_TYPES);
    return {
      parent_id: parentIds,
      type: canonicalTypes,
    };
  }

  async countCanonicalChildren(parentIds) {
    const criteria = this.getCanonicalChildrenCriteria(parentIds);
    return this.models.entity.count(criteria);
  }

  async getRelationsViaEntityRelation(hierarchyId, parentIds) {
    // get any matching alternative hierarchy relationships leading out of these parents
    return this.models.entityRelation.find({
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    });
  }

  async getRelationsCanonically(parentIds) {
    const criteria = this.getCanonicalChildrenCriteria(parentIds);
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
    Object.entries(childIdToAncestorIds).forEach(([childId, ancestorIds]) => {
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
