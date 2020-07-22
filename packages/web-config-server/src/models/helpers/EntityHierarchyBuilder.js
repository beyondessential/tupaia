/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
const asc = 'asc';
const desc = 'desc';
const newCache = () => ({ asc: {}, desc: {} });

const constructTypesCriteria = (types, prefix) =>
  types.length > 0 ? `${prefix} type IN (${types.map(() => '?').join(',')})` : '';

export class EntityHierarchyBuilder {
  constructor(entityModel, entityRelationModel) {
    this.models = {
      entity: entityModel,
      entityRelation: entityRelationModel,
    };
    this.cachedPromises = newCache();
    entityModel.addChangeHandler(this.invalidateCache);
    entityRelationModel.addChangeHandler(this.invalidateCache);
  }

  invalidateCache() {
    this.cachedPromises = newCache();
  }

  getCacheKey = (entityId, hierarchyId = 'canonical') => `${entityId}_${hierarchyId}`;

  async getDescendants(entityId, hierarchyId) {
    const cacheKey = this.getCacheKey(entityId, hierarchyId);
    if (!this.cachedPromises[desc][cacheKey]) {
      if (hierarchyId) {
        this.cachedPromises[desc][cacheKey] = this.getDescendantsNonCanonically(
          entityId,
          hierarchyId,
        );
      } else {
        // no alternative hierarchy prescribed, use the faster all-in-one sql query
        this.cachedPromises[desc][cacheKey] = this.getDescendantsCanonically(entityId);
      }
    }
    return this.cachedPromises[desc][cacheKey];
  }

  async getAncestors(entityId, hierarchyId) {
    const cacheKey = this.getCacheKey(entityId, hierarchyId);
    if (!this.cachedPromises[asc][cacheKey]) {
      this.cachedPromises[asc][cacheKey] = this.getAncestorsNonCanonically(entityId, hierarchyId);
    }
    return this.cachedPromises[asc][cacheKey];
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
    return this.recurseNonCanonicalHierarchy([{ id: entityId }], hierarchyId, desc);
  }

  async getAncestorsNonCanonically(entityId, hierarchyId) {
    return this.recurseNonCanonicalHierarchy([{ id: entityId }], hierarchyId, asc);
  }

  async recurseNonCanonicalHierarchy(entities, hierarchyId, direction) {
    const relations =
      direction === asc
        ? await this.getPreviousGeneration(entities, hierarchyId)
        : await this.getNextGeneration(entities, hierarchyId);

    // if we've made it to the leaf nodes, return an empty array
    if (relations.length === 0) {
      return [];
    }

    // keep recursing through the hierarchy
    const generations = await this.recurseNonCanonicalHierarchy(relations, hierarchyId, direction);
    return [...relations, ...generations];
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

  getPreviousGeneration = async (child, hierarchyId) => {
    // get any matching alternative hierarchy relationships leading out of this child
    const parentAlternativeRelation = hierarchyId
      ? await this.models.entityRelation.findOne({
          child_id: child.id,
          entity_hierarchy_id: hierarchyId,
        })
      : null;
    if (parentAlternativeRelation) {
      return this.models.entity.findOne({ id: parentAlternativeRelation.id });
    }
    return this.models.entity.findOne({ id: child.parent_id });
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

  /**
   * Fetch all ancestors of a given entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestors of
   * @param {boolean} [includeWorld=false] Optionally force the top level 'World' to be included
   */
  async getAncestorsCanonically(id, includeWorld = false, types = []) {
    const results = await this.models.entity.database.executeSql(
      `
      WITH RECURSIVE children AS (
        SELECT id, code, "name", parent_id, type, country_code, 0 AS generation
          FROM entity
          WHERE id = ?

        UNION ALL
        SELECT p.id, p.code, p."name", p.parent_id, p.type, p.country_code, c.generation + 1
          FROM children c
          JOIN entity p ON p.id = c.parent_id
          ${includeWorld ? '' : `WHERE p.code <> 'World'`}

      )
      SELECT *
        FROM children
        ${constructTypesCriteria(types, 'WHERE')}
        ORDER BY generation DESC;
    `,
      [id, ...types],
    );
    return results.map(result => this.models.entity.load(result));
  }
}
