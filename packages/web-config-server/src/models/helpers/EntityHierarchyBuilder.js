/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

export class EntityHierarchyBuilder {
  constructor(entityModel, entityRelationModel) {
    this.models = {
      entity: entityModel,
      entityRelation: entityRelationModel,
    };
    this.cachedPromises = {};
    entityModel.addChangeHandler(this.invalidateCache);
    entityRelationModel.addChangeHandler(this.invalidateCache);
  }

  invalidateCache = () => {
    this.cachedPromises = {};
  };

  getCacheKey = (entityId, hierarchyId = 'canonical') => `${entityId}_${hierarchyId}`;

  async getDescendants(entityId, hierarchyId) {
    const cacheKey = this.getCacheKey(entityId, hierarchyId);
    if (!this.cachedPromises[cacheKey]) {
      if (hierarchyId) {
        this.cachedPromises[cacheKey] = this.getDescendantsNonCanonically(entityId, hierarchyId);
      } else {
        // no alternative hierarchy prescribed, use the faster all-in-one sql query
        this.cachedPromises[cacheKey] = this.getDescendantsCanonically(entityId);
      }
    }
    return this.cachedPromises[cacheKey];
  }

  async getChildren(entityId, hierarchyId) {
    return this.getNextGeneration([{ id: entityId }], hierarchyId);
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string} entityId      The entity to start at
   * @param {string} hierarchyId   The specific hierarchy to follow through entity_relation
   */
  async getDescendantsNonCanonically(entityId, hierarchyId) {
    return this.recurseNonCononicalHierarchy([{ id: entityId }], hierarchyId);
  }

  async recurseNonCononicalHierarchy(parents, hierarchyId) {
    const children = await this.getNextGeneration(parents, hierarchyId);

    // if we've made it to the leaf nodes, return an empty array
    if (children.length === 0) {
      return [];
    }

    // keep recursing down the hierarchy
    const descendants = await this.recurseNonCononicalHierarchy(children, hierarchyId);
    return [...children, ...descendants];
  }

  getNextGeneration = async (parents, hierarchyId) => {
    // get any matching alternative hierarchy relationships leading out of these parents
    const parentIds = parents.map(p => p.id);
    const hierarchyLinks = hierarchyId
      ? await this.models.entityRelation.find({
          parent_id: parentIds,
          entity_hierarchy_id: hierarchyId,
        })
      : [];
    const childIds = hierarchyLinks.map(l => l.child_id);

    if (childIds.length > 0) {
      return this.models.entity.find({ id: childIds });
    }

    const canonicalTypes = Object.values(this.models.entity.orgUnitEntityTypes);
    return this.models.entity.find({ parent_id: parentIds, type: canonicalTypes });
  };

  async getDescendantsCanonically(entityId) {
    const canonicalTypes = Object.values(this.models.entity.orgUnitEntityTypes).join("','");
    const results = await this.models.entity.database.executeSql(
      `
        WITH RECURSIVE descendants AS (
          SELECT *, 0 AS generation
            FROM entity
            WHERE parent_id = ? AND type IN ('${canonicalTypes}')

          UNION ALL
          SELECT c.*, d.generation + 1
            FROM descendants d
            JOIN entity c ON c.parent_id = d.id
        )
        SELECT ${this.models.entity.getSqlForColumns('descendants')}
        FROM descendants
        ORDER BY generation;
    `,
      [entityId],
    );
    return results.map(result => this.models.entity.load(result));
  }
}
