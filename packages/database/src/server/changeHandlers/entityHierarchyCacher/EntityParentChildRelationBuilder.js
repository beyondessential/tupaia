import { ORG_UNIT_ENTITY_TYPES } from '../../../core/modelClasses/Entity';

/**
 * Builds and caches the entity parent child relations for a given hierarchy
 * This never wipes the subtrees and rebuilds, always only adds new ones and deletes the obsolete ones
 * in order to keep the data to be synced minimal
 */
export class EntityParentChildRelationBuilder {
  constructor(models) {
    this.models = models;
  }

  /**
   * Rebuilds the entity parent child relations for the given rebuild jobs
   * @param {{hierarchyId: string; rootEntityId: string}[]} rebuildJobs
   */
  async rebuildRelations(rebuildJobs) {
    // projects are the root entities of every full tree, so start with them
    for (const { hierarchyId, rootEntityId } of rebuildJobs) {
      const project = await this.models.project.findOne({ entity_hierarchy_id: hierarchyId });
      await this.rebuildRelationsForEntity(hierarchyId, rootEntityId, project);
    }
  }

  /**
   * Rebuilds the entity parent child relations for a given project
   * @param {import('../../../core/modelClasses/Project').Project} project
   */
  async rebuildRelationsForProject(project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    await this.models.entityParentChildRelation.delete({
      entity_hierarchy_id: hierarchyId,
    });
    await this.rebuildRelationsForEntity(hierarchyId, projectEntityId, project);
  }

  /**
   * Rebuilds the entity parent child relations for a given entity
   * It traverses the hierarchy from the root entity to the leaves, and caches new relations + deletes obsolete ones
   * @param {string} hierarchyId
   * @param {string} rootEntityId
   * @param {import('../../../core/modelClasses/Project').Project} project
   */
  async rebuildRelationsForEntity(hierarchyId, rootEntityId, project) {
    const { entity_id: projectEntityId } = project;
    await this.fetchAndCacheChildren(hierarchyId, [rootEntityId]);
    await this.deleteOrphanedRelations(hierarchyId, projectEntityId);
  }

  async fetchAndCacheChildren(hierarchyId, parentIds, childrenAlreadyCached = new Set()) {
    const entityRelationChildCount = await this.countEntityRelationChildren(hierarchyId, parentIds);
    const useEntityRelationLinks = entityRelationChildCount > 0;

    // Generate the new relations for this level
    const validParentChildIdPairs = useEntityRelationLinks
      ? await this.generateViaEntityRelation(hierarchyId, parentIds, childrenAlreadyCached)
      : await this.generateViaCanonical(hierarchyId, parentIds, childrenAlreadyCached);

    if (validParentChildIdPairs.length === 0) {
      // When reaching a leaf node, there still might be some
      // obsolete relations in the cache that need to be deleted
      await this.models.entityParentChildRelation.delete({
        parent_id: parentIds,
        entity_hierarchy_id: hierarchyId,
      });
      return; // at a leaf node generation, no need to go any further
    }

    const validChildIds = validParentChildIdPairs.map(pair => pair[1]);

    // Delete the obsolete relations for this level
    await this.deleteObsoleteRelationsForParents(hierarchyId, parentIds, validParentChildIdPairs);

    const latestChildrenAlreadyCached = new Set([...childrenAlreadyCached, ...validChildIds]);
    return this.fetchAndCacheChildren(hierarchyId, validChildIds, latestChildrenAlreadyCached);
  }

  /**
   * Cache the current level via entity relations
   * @param {*} hierarchyId
   * @param {*} parentIds
   * @param {*} childrenAlreadyCached
   * @returns
   */
  async generateViaEntityRelation(hierarchyId, parentIds, childrenAlreadyCached = new Set()) {
    const entityRelations = await this.models.entityRelation.find({
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    });
    const entityParentChildRelations = entityRelations
      .map(relation => ({
        parent_id: relation.parent_id,
        child_id: relation.child_id,
        entity_hierarchy_id: hierarchyId,
      }))
      // If the relation is already generated (could be that it is already a child of another parent)
      // it should be ignored
      .filter(relation => !childrenAlreadyCached.has(relation.child_id));

    if (entityParentChildRelations.length === 0) {
      return [];
    }

    return this.insertRelations(entityParentChildRelations);
  }

  /**
   * Cache the current level via canonical types
   * @param {*} hierarchyId
   * @param {*} parentIds
   * @param {*} childrenAlreadyCached
   * @returns
   */
  async generateViaCanonical(hierarchyId, parentIds, childrenAlreadyCached = new Set()) {
    const canonicalTypes = await this.getCanonicalTypes(hierarchyId);
    const entities = await this.models.entity.find({
      parent_id: parentIds,
      type: canonicalTypes,
    });
    const entityParentChildRelations = entities
      .map(e => ({
        parent_id: e.parent_id,
        child_id: e.id,
        entity_hierarchy_id: hierarchyId,
      }))
      // If the relation is already generated (could be that it is already a child of another parent)
      // it should be ignored
      .filter(relation => !childrenAlreadyCached.has(relation.child_id));

    if (entityParentChildRelations.length === 0) {
      return [];
    }

    return this.insertRelations(entityParentChildRelations);
  }

  async insertRelations(entityParentChildRelations) {
    // If the relation is already generated, it should be ignored
    await this.models.entityParentChildRelation.createMany(entityParentChildRelations, {
      onConflictIgnore: ['entity_hierarchy_id', 'parent_id', 'child_id'],
    });

    return entityParentChildRelations.map(e => [e.parent_id, e.child_id]);
  }

  /**
   * @private
   */
  async countEntityRelationChildren(hierarchyId, parentIds) {
    return this.models.entityRelation.count({
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    });
  }

  async getCanonicalTypes(hierarchyId) {
    const entityHierarchy = await this.models.entityHierarchy.findById(hierarchyId);
    const { canonical_types: customCanonicalTypes } = entityHierarchy;
    const canonicalTypes =
      customCanonicalTypes && customCanonicalTypes.length > 0
        ? customCanonicalTypes
        : Object.values(ORG_UNIT_ENTITY_TYPES);

    return canonicalTypes;
  }

  /**
   * Delete the obsolete relations for a level of the hierarchy
   * @param {*} hierarchyId
   * @param {*} parentIds
   * @param {*} validParentChildIdPairs
   */
  async deleteObsoleteRelationsForParents(hierarchyId, parentIds, validParentChildIdPairs) {
    const valuesList = validParentChildIdPairs.map(() => '(?, ?)').join(', ');
    const values = validParentChildIdPairs.flatMap(pair => pair);

    // Delete any relations that:
    // - Belong to the parentIds
    // - Are not in the validParentChildIdPairs - which are the latest valid relations for this level
    await this.models.database.executeSql(
      `
      DELETE FROM entity_parent_child_relation 
      WHERE entity_hierarchy_id = ? 
        AND parent_id IN (${parentIds.map(() => '?').join(', ')})
        AND (parent_id, child_id) NOT IN (
          SELECT * FROM (VALUES ${valuesList}) AS pairs(parent_id, child_id)
        )
      RETURNING parent_id, child_id
    `,
      [hierarchyId, ...parentIds, ...values],
    );
  }

  /**
   * Delete the orphaned relations for a level of the hierarchy
   * @param {*} hierarchyId
   * @param {*} projectEntityId
   */
  async deleteOrphanedRelations(hierarchyId, projectEntityId) {
    await this.models.database.executeSql(
      `
      WITH RECURSIVE connected_nodes AS (
        -- Start with root nodes (entities that exist but aren't children)
        -- Start with the known root node
        SELECT '${projectEntityId}' as node_id 
                
        UNION ALL
        
        -- Recursively find all descendants
        SELECT er.child_id
        FROM entity_parent_child_relation er
        INNER JOIN connected_nodes cn ON er.parent_id = cn.node_id
          AND er.entity_hierarchy_id = ?
      ),
      -- Find orphaned relations (not connected to any root)
      orphaned_relations AS (
        SELECT er.*
        FROM entity_parent_child_relation er
        WHERE er.parent_id NOT IN (SELECT node_id FROM connected_nodes)
          AND er.entity_hierarchy_id = ?
      )
      -- Delete the orphaned relations
      DELETE FROM entity_parent_child_relation 
      WHERE id IN (SELECT id FROM orphaned_relations);
      `,
      [hierarchyId, hierarchyId],
    );
  }
}
