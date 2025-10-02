import { reduceToDictionary } from '@tupaia/utils';
import { ORG_UNIT_ENTITY_TYPES } from '../../modelClasses/Entity';
import { SqlQuery } from '../../SqlQuery';

export class EntityHierarchySubtreeRebuilder {
  constructor(models) {
    this.models = models;
  }

  /**
   * @public
   * Rebuilds subtrees listed in the rebuild jobs
   * @param {{hierarchyId: string; rootEntityId: string}[]} rebuildJobs
   */
  async rebuildSubtrees(rebuildJobs) {
    // get the subtrees to delete, then run the delete
    const subtreesForDelete = {};
    for (const { hierarchyId, rootEntityId } of rebuildJobs) {
      (subtreesForDelete[hierarchyId] ??= new Set()).add(rootEntityId);
    }
    const deletes = Object.entries(subtreesForDelete).map(async ([hierarchyId, rootEntityIds]) =>
      this.deleteSubtrees(hierarchyId, rootEntityIds),
    );
    await Promise.all(deletes);

    // get the unique set of hierarchies to be rebuilt, then run the rebuild
    const hierarchiesForRebuild = Object.keys(subtreesForDelete);
    await this.buildAndCacheHierarchies(hierarchiesForRebuild);
  }

  /**
   * @private
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
        WHERE
          entity_hierarchy_id = ?
        AND
          descendant_id IN ${SqlQuery.record(batchOfEntityIds)};
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
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    return this.fetchAndCacheDescendants(hierarchyId, { [projectEntityId]: [] });
  }

  /**
   * @private
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

  /**
   * @private
   */
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

  /**
   * @private
   */
  getEntityRelationChildrenCriteria(hierarchyId, parentIds) {
    return {
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    };
  }

  /**
   * @private
   */
  async countEntityRelationChildren(hierarchyId, parentIds) {
    const criteria = this.getEntityRelationChildrenCriteria(hierarchyId, parentIds);
    return this.models.entityRelation.count(criteria);
  }

  /**
   * @private
   */
  async getRelationsViaEntityRelation(hierarchyId, parentIds) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const criteria = this.getEntityRelationChildrenCriteria(hierarchyId, parentIds);
    return this.models.entityRelation.find(criteria);
  }

  /**
   * @private
   */
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

  /**
   * @private
   */
  async countCanonicalChildren(hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(hierarchyId, parentIds);
    return this.models.entity.count(criteria);
  }

  /**
   * @private
   */
  async getRelationsCanonically(hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(hierarchyId, parentIds);
    const children = await this.models.entity.find(criteria, {
      columns: ['id', 'parent_id'],
    });
    return children.map(c => ({ child_id: c.id, parent_id: c.parent_id }));
  }

  /**
   * @private
   * Stores the generation of ancestor/descendant info in the database
   * @param {string} hierarchyId
   * @param {Entity[]} childIdToAncestorIds   Ids of the child entities as keys, with the ids of their
   *                                          ancestors in order of generational distance, with immediate
   *                                          parent at index 0
   */
  async cacheGeneration(hierarchyId, childIdToAncestorIds) {
    const childIds = Object.keys(childIdToAncestorIds);
    const existingParentRelations = await this.models.ancestorDescendantRelation.find({
      descendant_id: childIds,
      entity_hierarchy_id: hierarchyId,
      generational_distance: 1,
    });
    const childrenAlreadyCached = new Set(existingParentRelations.map(r => r.descendant_id));
    const records = Object.entries(childIdToAncestorIds)
      .filter(([childId]) => !childrenAlreadyCached.has(childId))
      .flatMap(([childId, ancestorIds]) =>
        ancestorIds.map((ancestorId, i) => ({
          entity_hierarchy_id: hierarchyId,
          ancestor_id: ancestorId,
          descendant_id: childId,
          generational_distance: i + 1,
        })),
      );
    await this.models.ancestorDescendantRelation.createMany(records);
  }
}
