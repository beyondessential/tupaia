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

  invalidateCache() {
    this.cachedPromises = {};
  }

  getCacheKey = (entityId, hierarchyId = 'canonical') => `${entityId}_${hierarchyId}`;

  async getDescendants(entityId, hierarchyId) {
    const cacheKey = this.getCacheKey(entityId, hierarchyId);
    if (!this.cachedPromises[cacheKey]) {
      if (hierarchyId) {
        this.cachedPromises[cacheKey] = this.getDescendantsNonCanonically([entityId], hierarchyId);
      } else {
        // no alternative hierarchy prescribed, use the faster all-in-one sql query
        this.cachedPromises[cacheKey] = this.getDescendantsCanonically(entityId);
      }
    }
    return this.cachedPromises[cacheKey];
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string[]} parents      The entities to start at
   * @param {string} hierarchyId    The specific hierarchy to follow through entity_relation
   */
  async getDescendantsNonCanonically(parents, hierarchyId) {
    const children = await this.getNextGeneration(parents, hierarchyId);

    // if we've made it to the leaf nodes, return an empty array
    if (children.length === 0) {
      return [];
    }

    // keep recursing down the hierarchy
    const descendants = await this.getDescendantsNonCanonically(children, hierarchyId);
    return [...children, ...descendants];
  }

  getNextGeneration = async (parents, hierarchyId) => {
    // get any matching alternative hierarchy relationships leading out of these parents
    const parentIds = parents.map(p => p.id);
    const alternativeHierarchyLinks = hierarchyId
      ? await this.models.entityRelation.find({
          parent_id: parentIds,
          entity_hierarchy_id: hierarchyId,
        })
      : [];
    const childIds = alternativeHierarchyLinks.map(l => l.child_id);

    // if no alternative hierarchy links for this generation, follow the canonical relationships
    const children =
      childIds.length > 0
        ? await this.models.entity.find({ id: childIds })
        : await this.models.entity.find({ parent_id: parentIds });

    return children;
  };

  async getDescendantsCanonically(entityId) {
    const records = await this.models.entity.database.executeSql(
      `
        WITH RECURSIVE descendants AS (
          SELECT *, 0 AS generation
            FROM entity
            WHERE parent_id = ?

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

    return records.map(record => this.models.entity.load(record));
  }
}
