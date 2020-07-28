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
    this.cachedAncestorPromises = {};
    this.cachedDescendantPromises = {};
    entityModel.addChangeHandler(this.invalidateCaches);
    entityRelationModel.addChangeHandler(this.invalidateCaches);
  }

  invalidateCaches() {
    this.cachedAncestorPromises = {};
    this.cachedDescendantPromises = {};
  }

  getCacheKey = (entityId, hierarchyId) => `${entityId}_${hierarchyId}`;

  async getDescendants(entityId, hierarchyId) {
    const cacheKey = this.getCacheKey(entityId, hierarchyId);
    if (!this.cachedDescendantPromises[cacheKey]) {
      if (hierarchyId) {
        const rootEntity = { id: entityId };
        this.cachedDescendantPromises[cacheKey] = this.recursivelyFetchDescendants(
          [rootEntity],
          hierarchyId,
        );
      } else {
        // no alternative hierarchy prescribed, use the faster all-in-one sql query
        this.cachedDescendantPromises[cacheKey] = this.getDescendantsCanonically(entityId);
      }
    }
    return this.cachedDescendantPromises[cacheKey];
  }

  async getAncestors(entityId, hierarchyId) {
    const cacheKey = this.getCacheKey(entityId, hierarchyId);
    if (!this.cachedAncestorPromises[cacheKey]) {
      const entity = await this.models.entity.findOne(
        { id: entityId },
        {},
        { columns: this.models.entity.minimalFields },
      );
      this.cachedAncestorPromises[cacheKey] = this.recursivelyFetchAncestors(entity, hierarchyId);
    }
    return this.cachedAncestorPromises[cacheKey];
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
  async recursivelyFetchDescendants(parents, hierarchyId) {
    const children = await this.getNextGeneration(parents, hierarchyId);

    // if we've made it to the leaf nodes, return an empty array
    if (children.length === 0) {
      return [];
    }

    // keep recursing through the hierarchy
    const descendants = await this.recursivelyFetchDescendants(children, hierarchyId);
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

    // no hierarchy specific relations, get next generation following canonical relationships
    const canonicalTypes = Object.values(this.models.entity.orgUnitEntityTypes);
    return this.models.entity.find({ parent_id: parentIds, type: canonicalTypes });
  };

  async recursivelyFetchAncestors(child, hierarchyId) {
    // We have the assumption that we return single entities for parent search unlike children search
    const parent = await this.getPreviousGeneration(child, hierarchyId);

    // if no more parents, return an empty array
    if (!parent) {
      return [];
    }

    // keep recursing through the hierarchy
    const grandparent = await this.recursivelyFetchAncestors(parent, hierarchyId);
    return grandparent ? [parent, ...grandparent] : [parent];
  }

  getPreviousGeneration = async (child, hierarchyId) => {
    // get any matching hierarchy specific relationships leading out of this child
    const parentRelation = hierarchyId
      ? await this.models.entityRelation.findOne({
          child_id: child.id,
          entity_hierarchy_id: hierarchyId,
        })
      : null;
    if (parentRelation) {
      return this.models.entity.findOne(
        { id: parentRelation.parent_id },
        {},
        { columns: this.models.entity.minimalFields },
      );
    }

    // no parent via specific hierarchy, follow canonical relationship
    return child.parent_id
      ? this.models.entity.findOne(
          { id: child.parent_id },
          {},
          { columns: this.models.entity.minimalFields },
        )
      : null;
  };

  // faster way to recurse through canonical hierarchy using pure sql
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
