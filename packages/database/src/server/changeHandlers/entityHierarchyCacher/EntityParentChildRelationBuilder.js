import { generateId, SqlQuery } from '../../../core';
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
   * @public
   * @param {string[]} hierarchyIds The specific hierarchies to cache (defaults to all)
   */
  async buildAndCacheHierarchies(hierarchyIds) {
    // projects are the root entities of every full tree, so start with them
    const projectCriteria = hierarchyIds ? { entity_hierarchy_id: hierarchyIds } : {};
    const projects = await this.models.project.find(projectCriteria);
    const projectTasks = projects.map(async project => this.rebuildRelationsForProject(project));
    await Promise.all(projectTasks);
  }

  /**
   * Rebuilds the entity parent child relations for a given project
   * @param {import('../../../core/modelClasses/Project').Project} project
   */
  async rebuildRelationsForProject(project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    await this.rebuildRelationsForEntity(hierarchyId, projectEntityId, project);
  }

  /**
   * Rebuilds the entity parent child relations for a given entity
   * It traverses the hierarchy from the root entity to the leaves, and caches new relations + deletes obsolete ones
   * @param {string} hierarchyId hierarchy to rebuild relations for
   * @param {string} rootEntityId root/starting entity id to rebuild relations from
   * @param {import('../../../core/modelClasses/Project').Project} project
   */
  async rebuildRelationsForEntity(hierarchyId, rootEntityId, project) {
    const { entity_id: projectEntityId } = project;
    await this.fetchAndCacheChildren(hierarchyId, [rootEntityId]);
    await this.deleteOrphanedRelations(hierarchyId, projectEntityId);
  }

  async fetchAndCacheChildren(hierarchyId, parentIds, childrenAlreadyCached = new Set()) {
    const entityRelationChildCount = await this.countEntityRelationChildren(hierarchyId, parentIds);
    const hasEntityRelationLinks = entityRelationChildCount > 0;

    // Generate the new relations for this level
    const entityParentChildRelations = hasEntityRelationLinks
      ? await this.getRelationsViaEntityRelation(hierarchyId, parentIds, childrenAlreadyCached)
      : await this.getRelationsViaCanonical(hierarchyId, parentIds, childrenAlreadyCached);

    if (entityParentChildRelations.length) {
      await this.insertRelations(entityParentChildRelations);
    }

    const validParentChildIdPairs = entityParentChildRelations.map(e => [e.parent_id, e.child_id]);

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
   * @param {*} hierarchyId hierarchy to generate entity relation relations for
   * @param {*} parentIds parent ids of a single level to generate entity relation relations for
   * @param {*} childrenAlreadyCached children already cached to avoid duplicates
   * @returns
   */
  async getRelationsViaEntityRelation(hierarchyId, parentIds, childrenAlreadyCached = new Set()) {
    const entityRelations = await this.models.entityRelation.find({
      parent_id: parentIds,
      entity_hierarchy_id: hierarchyId,
    });
    return (
      entityRelations
        .map(relation => ({
          parent_id: relation.parent_id,
          child_id: relation.child_id,
          entity_hierarchy_id: hierarchyId,
        }))
        // If the relation is already generated (could be that it is already a child of another parent)
        // it should be ignored
        .filter(relation => !childrenAlreadyCached.has(relation.child_id))
    );
  }

  /**
   * Cache the current level via canonical types
   * @param {*} hierarchyId hierarchy to generate canonical relations for
   * @param {*} parentIds parent ids of a single level to generate canonical relations for
   * @param {*} childrenAlreadyCached children already cached to avoid duplicates
   * @returns
   */
  async getRelationsViaCanonical(hierarchyId, parentIds, childrenAlreadyCached = new Set()) {
    const canonicalTypes = await this.getCanonicalTypes(hierarchyId);
    const entities = await this.models.entity.find({
      parent_id: parentIds,
      type: canonicalTypes,
    });
    return (
      entities
        .map(e => ({
          parent_id: e.parent_id,
          child_id: e.id,
          entity_hierarchy_id: hierarchyId,
        }))
        // If the relation is already generated (could be that it is already a child of another parent)
        // it should be ignored
        .filter(relation => !childrenAlreadyCached.has(relation.child_id))
    );
  }

  async insertRelations(entityParentChildRelations) {
    // If the relation is already generated, it should be ignored
    await this.models.entityParentChildRelation.createMany(entityParentChildRelations, {
      onConflictIgnore: ['entity_hierarchy_id', 'parent_id', 'child_id'],
    });
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
      customCanonicalTypes?.length > 0
        ? customCanonicalTypes
        : Object.values(ORG_UNIT_ENTITY_TYPES);

    return canonicalTypes;
  }

  /**
   * Delete the obsolete relations for a level of the hierarchy.
   * We delete the obsolete relations that:
   * - at the current level (by checking parent_ids)
   * - not the valid parent child id pairs to keep in a level
   * @param {*} hierarchyId hierarchy to delete obsolete relations for
   * @param {*} parentIds parent ids of a single level to delete obsolete relations for
   * @param {*} validParentChildIdPairs valid parent child id pairs to keep
   */
  async deleteObsoleteRelationsForParents(hierarchyId, parentIds, validParentChildIdPairs) {
    const tempValidPairsTableName = `temp_valid_pairs_${generateId()}`;
    try {
      await this.models.database.executeSql(
        'CREATE TEMPORARY TABLE ?? (parent_id TEXT, child_id TEXT)',
        [tempValidPairsTableName],
      );

      await this.models.database.executeSqlInBatches(
        validParentChildIdPairs,
        batchOfValidParentChildIdPairs => {
          const values = batchOfValidParentChildIdPairs.flat();
          return [
            `INSERT INTO ?? (parent_id, child_id)
            VALUES ${batchOfValidParentChildIdPairs.map(() => '(?,?)').join(',')}`,
            [tempValidPairsTableName, ...values],
          ];
        },
      );

      await this.models.database.executeSqlInBatches(parentIds, batchOfParentIds => [
        `
          DELETE FROM entity_parent_child_relation
          WHERE entity_hierarchy_id = ?
            AND parent_id IN ${SqlQuery.record(batchOfParentIds)}
            AND (parent_id, child_id) NOT IN (
              SELECT parent_id, child_id FROM ??
            )
          RETURNING parent_id, child_id
        `,
        [hierarchyId, ...batchOfParentIds, tempValidPairsTableName],
      ]);
    } finally {
      await this.models.database.executeSql('DROP TABLE IF EXISTS ??', [tempValidPairsTableName]);
    }
  }

  /**
   * Delete the orphaned relations for a level of the hierarchy
   * @param {*} hierarchyId hierarchy to delete orphaned relations for
   * @param {*} projectEntityId project entity id (root entity) to delete orphaned relations for
   */
  async deleteOrphanedRelations(hierarchyId, projectEntityId) {
    await this.models.database.executeSql(
      `
      WITH RECURSIVE connected_nodes AS (
        -- Start with root nodes (entities that exist but aren't children)
        -- Start with the known root node
        SELECT ? as node_id

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
      [projectEntityId, hierarchyId, hierarchyId],
    );
  }
}
