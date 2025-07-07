import { ORG_UNIT_ENTITY_TYPES } from '../../../core/modelClasses/Entity';

export class EntityParentChildRelationBuilder {
  constructor(models) {
    this.models = models;
  }

  /**
   * @public
   * @param {string[]} hierarchyIds The specific hierarchies to cache (defaults to all)
   */
  async rebuildRelations(rebuildJobs) {
    // projects are the root entities of every full tree, so start with them
    for (const { hierarchyId, rootEntityId, rebuildEntityParentChildRelations } of rebuildJobs) {
      if (rebuildEntityParentChildRelations) {
        const project = await this.models.project.findOne({ entity_hierarchy_id: hierarchyId });
        await this.rebuildRelationsForProject(project);
      } else {
        await this.rebuildRelationsForEntity({ hierarchyId, rootEntityId, project });
      }
    }
  }

  /**
   * @public
   */
  async rebuildRelationsForProject(project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    await this.models.entityParentChildRelation.delete({
      entity_hierarchy_id: hierarchyId,
    });
    await this.fetchAndCacheChildren(hierarchyId, [projectEntityId]);
    await this.deleteStaleRelations(hierarchyId, projectEntityId);
  }

  async rebuildRelationsForEntity({ hierarchyId, rootEntityId, project }) {
    const { entity_id: projectEntityId } = project;
    await this.fetchAndCacheChildren(hierarchyId, [rootEntityId]);
    await this.deleteStaleRelations(hierarchyId, projectEntityId);
  }

  async fetchAndCacheChildren(hierarchyId, parentIds) {
    const entityRelationChildCount = await this.countEntityRelationChildren(hierarchyId, parentIds);
    const useEntityRelationLinks = entityRelationChildCount > 0;
    const childCount = useEntityRelationLinks
      ? entityRelationChildCount
      : await this.countCanonicalChildren(hierarchyId, parentIds);

    if (childCount === 0) {
      // When reaching a leaf node, there still might be some stale relations in the cache that need to be deleted
      await this.models.entityParentChildRelation.delete({
        parent_id: parentIds,
        entity_hierarchy_id: hierarchyId,
      });
      return; // at a leaf node generation, no need to go any further
    }

    const existingChildIds = useEntityRelationLinks
      ? await this.generateEntityRelationChildren(hierarchyId, parentIds)
      : await this.generateCanonicalChildren(hierarchyId, parentIds);

    // Invalidate the cache for the children that are no longer valid
    await this.models.entityParentChildRelation.delete({
      parent_id: parentIds,
      child_id: {
        comparator: 'NOT IN',
        comparisonValue: existingChildIds,
      },
      entity_hierarchy_id: hierarchyId,
    });

    return this.fetchAndCacheChildren(hierarchyId, existingChildIds);
  }

  async generateEntityRelationChildren(hierarchyId, parentIds) {
    const entityRelations = await this.models.entityRelation.find({
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    });
    const entityParentChildRelations = entityRelations.map(relation => ({
      parent_id: relation.parent_id,
      child_id: relation.child_id,
      entity_hierarchy_id: hierarchyId,
    }));
    await this.models.entityParentChildRelation.createMany(entityParentChildRelations, {
      onConflictIgnore: ['entity_hierarchy_id', 'parent_id', 'child_id'],
    });

    return entityParentChildRelations.map(e => e.child_id);
  }

  async generateCanonicalChildren(hierarchyId, parentIds) {
    const canonicalTypes = await this.getCanonicalTypes(hierarchyId);
    const entities = await this.models.entity.find({
      parent_id: parentIds,
      type: canonicalTypes,
    });
    const entityParentChildRelations = entities.map(e => ({
      parent_id: e.parent_id,
      child_id: e.id,
      entity_hierarchy_id: hierarchyId,
    }));
    await this.models.entityParentChildRelation.createMany(entityParentChildRelations, {
      onConflictIgnore: ['entity_hierarchy_id', 'parent_id', 'child_id'],
    });

    return entityParentChildRelations.map(e => e.child_id);
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

  /**
   * @private
   */
  async countCanonicalChildren(hierarchyId, parentIds) {
    const criteria = await this.getCanonicalChildrenCriteria(hierarchyId, parentIds);
    return this.models.entity.count(criteria);
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
   * @private
   */
  async getCanonicalChildrenCriteria(hierarchyId, parentIds) {
    // Only include entities of types that are considered canonical, either using a custom set of
    // canonical types defined by the hierarchy, or the default, which is org unit types.
    const canonicalTypes = await this.getCanonicalTypes(hierarchyId);
    return {
      parent_id: parentIds,
      type: canonicalTypes,
    };
  }

  async deleteStaleRelations(hierarchyId, projectEntityId) {
    console.log('projectEntityId', projectEntityId);
    console.log('hierarchyId', hierarchyId);
    console.log(
      'entityParentChildRelations',
      (await this.models.entityParentChildRelation.find({
        entity_hierarchy_id: hierarchyId,
      })).map(e => ({
        parent_id: e.parent_id,
        child_id: e.child_id,
      })),
    );
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

    // const orphanedRelations = await this.models.database.executeSql(
    //   `
    //   WITH RECURSIVE connected_nodes AS (
    //     -- Start with root nodes (entities that exist but aren't children)
    //     -- Start with the known root node
    //     SELECT '${projectEntityId}' as node_id 
                
    //     UNION ALL
        
    //     -- Recursively find all descendants
    //     SELECT er.child_id
    //     FROM entity_parent_child_relation er
    //     INNER JOIN connected_nodes cn ON er.parent_id = cn.node_id
    //       AND er.entity_hierarchy_id = ?
    //   ),
    //   -- Find orphaned relations (not connected to any root)
    //   orphaned_relations AS (
    //     SELECT er.*
    //     FROM entity_parent_child_relation er
    //     WHERE er.parent_id NOT IN (SELECT node_id FROM connected_nodes)
    //       AND er.entity_hierarchy_id = ?
    //   )
    //   -- Delete the orphaned relations
    //   SELECT * FROM orphaned_relations;
    //   `,
    //   [hierarchyId, hierarchyId],
    // );

    // console.log('connectedNodes', connectedNodes);
    // console.log('orphanedRelations', orphanedRelations);
  }
}
