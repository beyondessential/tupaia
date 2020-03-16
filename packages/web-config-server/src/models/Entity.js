/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { capital } from 'case';
import groupBy from 'lodash.groupby';

import { TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import { BaseModel } from './BaseModel';
import { EntityRelation } from './EntityRelation';

// entity types
const FACILITY = 'facility';
const REGION = 'region';
const COUNTRY = 'country';
const WORLD = 'world';
const CASE = 'case';
const DISASTER = 'disaster';
const VILLAGE = 'village';
const PROJECT = 'project';

export const ENTITY_TYPES = {
  FACILITY,
  REGION,
  COUNTRY,
  WORLD,
  CASE,
  DISASTER,
  VILLAGE,
  PROJECT,
};

export const ORG_UNIT_ENTITY_TYPES = {
  FACILITY,
  REGION,
  COUNTRY,
  WORLD,
};

const ORG_UNIT_TYPE_LIST = Object.values(ORG_UNIT_ENTITY_TYPES);

const ENTITY_TYPE_TO_HIERARCHY = {
  [PROJECT]: 'project',
};

const constructTypesCriteria = (types, prefix) =>
  types.length > 0 ? `${prefix} type IN (${types.map(() => '?').join(',')})` : '';

export class Entity extends BaseModel {
  static databaseType = TYPES.ENTITY;

  static fields = ['id', 'code', 'type', 'parent_id', 'country_code', 'name', 'point', 'region'];

  static FACILITY = FACILITY;

  static COUNTRY = COUNTRY;

  static REGION = REGION;

  static DISASTER = DISASTER;

  static WORLD = WORLD;

  constructor() {
    super();
    this.cache = {};
  }

  /**
   * Fetch all ancestors of a given entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestors of
   * @param {boolean} [includeWorld=false] Optionally force the top level 'World' to be included
   */
  static async getAllAncestors(id, includeWorld = false, types = []) {
    return Entity.database.executeSql(
      `
      WITH RECURSIVE children AS (
        SELECT id, code, "name", parent_id, type, 0 AS generation
          FROM entity
          WHERE id = ?

        UNION ALL
        SELECT p.id, p.code, p."name", p.parent_id, p.type, c.generation + 1
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
  }

  /**
   * Fetch all ancestors of the current entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestors of
   * @param {boolean} [includeWorld=false] Optionally force the top level 'World' to be included
   */
  async getAllAncestors(includeWorld = false) {
    const cacheKey = `ancestors${includeWorld ? 'IncludingWorld' : 'ExcludingWorld'}`;
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = await Entity.getAllAncestors(this.id, includeWorld);
    }
    return this.cache[cacheKey];
  }

  /**
   * Fetch the codes of all ancestors of the current entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestor codes of
   * @param {boolean} [includeWorld=false] Optionally force the top level 'World' to be included
   */
  async getAncestorCodes(includeWorld = false) {
    const ancestors = await this.getAllAncestors(includeWorld);
    return ancestors.map(({ code }) => code);
  }

  async getOrgUnitAncestors(includeWorld = false) {
    return Entity.getAllAncestors(this.id, includeWorld, ORG_UNIT_TYPE_LIST);
  }

  async getCountry() {
    if (this.type === COUNTRY) return this;
    const ancestors = await Entity.getAllAncestors(this.id, false, [COUNTRY]);
    return ancestors.length > 0 ? ancestors[0] : null;
  }

  static async getCanonicalDescendants(id, types = []) {
    return Entity.database.executeSql(
      `
      WITH RECURSIVE descendants AS (
        SELECT *, 0 AS generation
          FROM entity
          WHERE id = ?

        UNION ALL
        SELECT c.*, d.generation + 1
          FROM descendants d
          JOIN entity c ON c.parent_id = d.id
      )
      SELECT id, code, "name", parent_id, type
        FROM descendants
        ${constructTypesCriteria(types, 'WHERE')}
        ORDER BY generation ASC;
    `,
      [id, ...types],
    );
  }

  static async getNextGeneration(parentIds, hierarchyName) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const alternativeHierarchyLinks = await EntityRelation.find({
      parent_id: parentIds,
      hierarchy: hierarchyName,
    });
    const childIds = alternativeHierarchyLinks.map(l => l.child_id);

    // if no alternative hierarchy links for this generation, follow the canonical relationships
    if (childIds.length === 0) {
      return Entity.getEntities(`parentId IN (${parentIds.map(() => '?').join(',')})`, parentIds);
    }

    return Entity.getEntities(`id IN (${childIds.map(() => '?').join(',')})`, childIds);
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * Assumptions:
   *  - All entities of a given type exist at the same level down the hierarchy, so if we see any of
   *    the given type, we don't need to search any deeper for others
   * @param {string[]} parentIds     The ids of the entities to start at
   * @param {string} hierarchyName   The specific hierarchy to follow through entity_relation
   * @param {string} entityType      The type of descendant entity required
   */
  static async getAlternativeHierarchyDescendants(parentIds, hierarchyName, entityType) {
    const children = await Entity.getNextGeneration(parentIds, hierarchyName);

    // if we've made it to the leaf nodes, no descendants of the specified type exist
    if (children.length === 0) {
      return [];
    }

    // if we've reached the level with descendants of the correct type, return them
    const childrenOfType = children.filter(c => c.type === entityType);
    if (childrenOfType.length > 0) {
      return childrenOfType;
    }

    // didn't find children of the right type at this level, keep recursing down the hierarchy
    return Entity.getAlternativeHierarchyDescendants(
      children.map(c => c.id),
      hierarchyName,
      entityType,
    );
  }

  static async getFacilityDescendantsWithCoordinates(code) {
    return Entity.database.executeSql(
      `
      WITH RECURSIVE children AS (
        SELECT id, code, name, point, type, 0 AS generation
        FROM   entity
        WHERE  code = ?

        UNION  ALL
        SELECT p.id, p.code, p.name, p.point, p.type, c.generation + 1
        FROM   children      c
        JOIN   entity p ON p.parent_id = c.id
      )
        SELECT
          children.id,
          children.code,
          ST_AsGeoJSON(children.point) AS point,
          clinic.category_code,
          clinic.type_name,
          clinic.type,
          children.name
        FROM children
        INNER JOIN clinic
          ON clinic.code = children.code
        WHERE
          children.type = ?;
    `,
      [code, FACILITY],
    );
  }

  static async getChildRegions(code) {
    return Entity.database.executeSql(
      `
      SELECT
        id,
        code,
        name,
        image_url,
        parent_id,
        ST_AsGeoJSON(region) as region,
        ST_AsGeoJSON(bounds) as bounds,
        type
      FROM entity
      WHERE
        region IS NOT NULL
        AND parent_id IN (
          SELECT id
            FROM entity
            WHERE code = ?
        );
    `,
      [code],
    );
  }

  static async getEntityByCode(code) {
    const result = await Entity.database.executeSql(
      `
      SELECT
        id,
        code,
        country_code,
        name,
        image_url,
        parent_id,
        ST_AsGeoJSON(point) as point,
        ST_AsGeoJSON(bounds) as bounds,
        (region IS NOT NULL) as has_region,
        type
      FROM entity
      WHERE
        code = ?;
    `,
      [code],
    );
    return result[0];
  }

  static async getEntity(id) {
    const result = await Entity.database.executeSql(
      `
      SELECT
        id,
        code,
        country_code,
        name,
        image_url,
        parent_id,
        ST_AsGeoJSON(point) as point,
        ST_AsGeoJSON(bounds) as bounds,
        (region IS NOT NULL) as has_region,
        type
      FROM entity
      WHERE
        id = ?;
    `,
      [id],
    );
    return result[0];
  }

  // todo replace with a more ORM style `find` function after merging with rohan's work
  static async getEntities(where, substitutions) {
    return Entity.database.executeSql(
      `
      SELECT
        id,
        code,
        country_code,
        name,
        image_url,
        parent_id,
        ST_AsGeoJSON(point) as point,
        ST_AsGeoJSON(bounds) as bounds,
        (region IS NOT NULL) as has_region,
        type
      FROM entity
      WHERE ${where};
    `,
      substitutions,
    );
  }

  static async getAllChildren(id, types = []) {
    return Entity.database.executeSql(
      `
      SELECT
        id,
        code,
        country_code,
        name,
        image_url,
        parent_id,
        ST_AsGeoJSON(point) as point,
        ST_AsGeoJSON(bounds) as bounds,
        type
      FROM entity
      WHERE
        parent_id = ? ${constructTypesCriteria(types, 'AND')}
      ORDER BY
        name;
    `,
      [id, ...types],
    );
  }

  static async getOrgUnitChildren(id) {
    return Entity.getAllChildren(id, ORG_UNIT_TYPE_LIST);
  }

  async getDescendantsOfType(entityType) {
    const hierarchyName = ENTITY_TYPE_TO_HIERARCHY[this.type];
    // if no alternative hierarchy was specified, we can return the canonical descendants in a
    // single query
    if (!hierarchyName) {
      return Entity.getCanonicalDescendants(this.id, [entityType]);
    }

    return Entity.getAlternativeHierarchyDescendants(this.id, hierarchyName, entityType);
  }

  static fetchChildToParentCode = async childrenCodes => {
    const children = await Entity.find({ code: childrenCodes });
    const parentIds = children.map(({ parent_id: parentId }) => parentId);
    const parents = await Entity.find({ id: parentIds });
    const parentIdToCode = reduceToDictionary(parents, 'id', 'code');

    return children.reduce(
      (map, { code, parent_id: parentId }) => ({
        ...map,
        [code]: parentIdToCode[parentId],
      }),
      {},
    );
  };

  getOrganisationLevel() {
    if (this.type === 'region') return 'Province'; // this is the exception to the rule, the rest are a simple case translation
    return capital(this.type); // facility -> Facility
  }

  async buildDisplayName() {
    const ancestors = await this.getAllAncestors();
    return ancestors
      .reverse()
      .map(ancestor => ancestor.name)
      .join(', ');
  }

  isFacility() {
    return this.type === FACILITY;
  }

  async getFacilitiesByType() {
    const facilityDescendants = await Entity.getFacilityDescendantsWithCoordinates(this.code);
    return groupBy(facilityDescendants, 'type_name');
  }
}
