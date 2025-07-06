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
    for (const { hierarchyId, affectedEntityId, rebuildEntityParentChildRelations } of rebuildJobs) {
      if (rebuildEntityParentChildRelations) {
        const project = await this.models.project.findOne({ entity_hierarchy_id: hierarchyId });
        await this.rebuildRelationsForProject(project);
      } else {
        await this.rebuildRelationsForEntity({ hierarchyId, affectedEntityId });  
      }
    }
   
  }

  /**
   * @public
   */
  async rebuildRelationsForProject(project) {
    const { entity_id: projectEntityId, entity_hierarchy_id: hierarchyId } = project;
    return this.fetchAndCacheChildren(hierarchyId, { [projectEntityId]: [] });
  }

  async updateResolvedEntityRelations(rebuildJobs) {
    const tasks = rebuildJobs.map(async ({ hierarchyId, affectedEntityId }) =>
      this.rebuildRelationsForEntity({ hierarchyId, affectedEntityId }),
    );
    await Promise.all(tasks);
  }

  async rebuildRelationsForEntity({ hierarchyId, affectedEntityId }) {
    if (!affectedEntityId) {
      return;
    }
    console.log('hierarchyId', hierarchyId);
    await this.models.entityParentChildRelation.delete({
      entity_hierarchy_id: hierarchyId,
      child_id: affectedEntityId,
    });
    const entityRelation = await this.models.entityRelation.findOne({
      child_id: affectedEntityId,
      entity_hierarchy_id: hierarchyId,
    });
    const record = entityRelation
      ? entityRelation
      : await this.models.entity.findOne({ id: affectedEntityId });

    if (record) {
      await this.models.entityParentChildRelation.create({
        parent_id: record.parent_id,
        child_id: affectedEntityId,
        entity_hierarchy_id: hierarchyId,
      });
    }
  }

  async fetchAndCacheChildren(hierarchyId, parentIds) {
    const entityRelationChildCount = await this.countEntityRelationChildren(hierarchyId, parentIds);
    const useEntityRelationLinks = entityRelationChildCount > 0;
    const childCount = useEntityRelationLinks
      ? entityRelationChildCount
      : await this.countCanonicalChildren(hierarchyId, parentIds);

    if (childCount === 0) {
      return; // at a leaf node generation, no need to go any further
    }

    const childIds = useEntityRelationLinks
      ? await this.generateEntityRelationChildren(hierarchyId, parentIds)
      : await this.generateCanonicalChildren(hierarchyId, parentIds);

    return this.fetchAndCacheChildren(hierarchyId, childIds);
  }

  async generateEntityRelationChildren(hierarchyId, parentIds) {
    const insertedResults = await this.models.database.executeSqlInBatches(
      parentIds,
      batchOfParentIds => [
        `
          INSERT INTO entity_parent_child_relation (parent_id, child_id, entity_hierarchy_id)
          SELECT parent_id, child_id, entity_hierarchy_id
          FROM entity_relation
          WHERE
            entity_hierarchy_id = ?
          AND
            parent_id IN (${batchOfParentIds.map(() => '?').join(',')});
          RETURNING child_id;
        `,
        [hierarchyId, ...batchOfParentIds],
      ],
    );

    return insertedResults.map(result => result.child_id);
  }

  async generateCanonicalChildren(hierarchyId, parentIds) {
    const entityHierarchy = await this.models.entityHierarchy.findById(hierarchyId);
    const { canonical_types: customCanonicalTypes } = entityHierarchy;

    const insertedResults = await this.models.database.executeSqlInBatches(
      parentIds,
      batchOfParentIds => [
        `
        INSERT INTO entity_parent_child_relation (parent_id, child_id)
        SELECT parent_id, id
        FROM entity
        WHERE
          type IN (${customCanonicalTypes.map(() => '?').join(',')})
        AND
          parent_id IN (${batchOfParentIds.map(() => '?').join(',')});
        RETURNING child_id;
      `,
        [hierarchyId, ...customCanonicalTypes, ...batchOfParentIds],
      ],
    );

    return insertedResults.map(result => result.child_id);
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

  /**
   * @private
   */
  async getCanonicalChildrenCriteria(hierarchyId, parentIds) {
    // Only include entities of types that are considered canonical, either using a custom set of
    // canonical types defined by the hierarchy, or the default, which is org unit types.
    const entityHierarchy = await this.models.entityHierarchy.findById(hierarchyId);
    console.log('hierarchyId', hierarchyId);
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
}
