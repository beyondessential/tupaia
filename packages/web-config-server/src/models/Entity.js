/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { capital } from 'case';
import tail from 'lodash.tail';

import { TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import { BaseModel } from './BaseModel';
import { EntityRelation } from './EntityRelation';
import { Project } from './Project';

const CASE = 'case';
const COUNTRY = 'country';
const DISASTER = 'disaster';
const FACILITY = 'facility';
const REGION = 'region';
const VILLAGE = 'village';
const WORLD = 'world';
const PROJECT = 'project';

export const ENTITY_TYPES = {
  CASE,
  COUNTRY,
  DISASTER,
  FACILITY,
  REGION,
  VILLAGE,
  WORLD,
  PROJECT,
};

const constructTypesCriteria = (types, prefix) =>
  types.length > 0 ? `${prefix} type IN (${types.map(() => '?').join(',')})` : '';

export class Entity extends BaseModel {
  static databaseType = TYPES.ENTITY;

  static fields = [
    'id',
    'code',
    'type',
    'parent_id',
    'country_code',
    'name',
    'point',
    'region',
    'bounds',
    'image_url',
  ];

  static geoFields = ['point', 'region', 'bounds'];

  static getColumnSpecs = tableAlias => {
    const tableAliasPrefix = tableAlias ? `${tableAlias}.` : '';
    return Entity.fields.map(field => {
      if (Entity.geoFields.includes(field)) {
        return { [field]: `ST_AsGeoJSON(${tableAliasPrefix}${field})` };
      } else {
        return { [field]: `${tableAliasPrefix}${field}` };
      }
    });
  };

  static getSqlForColumns = tableAlias =>
    Entity.getColumnSpecs(tableAlias).map(columnSpec => {
      const [fieldAlias, selector] = Object.entries(columnSpec)[0];
      return `${selector} as ${fieldAlias}`;
    });

  static FACILITY = FACILITY;

  static COUNTRY = COUNTRY;

  static REGION = REGION;

  static DISASTER = DISASTER;

  static WORLD = WORLD;

  static orgUnitEntityTypes = {
    WORLD,
    COUNTRY,
    REGION,
    FACILITY,
    VILLAGE,
  };

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

  async getCountry() {
    if (this.type === COUNTRY) return this;
    const ancestors = await Entity.getAllAncestors(this.id, false, [COUNTRY]);
    return ancestors.length > 0 ? ancestors[0] : null;
  }

  async getDescendantsAndSelf(hierarchyId) {
    if (hierarchyId) {
      const descendants = await Entity.getDescendantsNonCanonically([this], hierarchyId);
      const parent = await Entity.findById(this.parent_id);
      this.parent_code = parent.code;
      return [this, ...descendants];
    }
    // no alternative hierarchy prescribed, use the faster all-in-one sql query
    return this.getDescendantsAndSelfCanonically();
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * @param {string[]} parents      The entities to start at
   * @param {string} hierarchyId    The specific hierarchy to follow through entity_relation
   */
  static async getDescendantsNonCanonically(parents, hierarchyId) {
    const children = await Entity.getNextGeneration(parents, hierarchyId);

    // if we've made it to the leaf nodes, return an empty array
    if (children.length === 0) {
      return [];
    }

    // keep recursing down the hierarchy
    const descendants = await Entity.getDescendantsNonCanonically(children, hierarchyId);
    return [...children, ...descendants];
  }

  static async getNextGeneration(parents, hierarchyId) {
    // get any matching alternative hierarchy relationships leading out of these parents
    const parentIds = parents.map(p => p.id);
    const alternativeHierarchyLinks = hierarchyId
      ? await EntityRelation.find({
          parent_id: parentIds,
          entity_hierarchy_id: hierarchyId,
        })
      : [];
    const childIds = alternativeHierarchyLinks.map(l => l.child_id);

    // if no alternative hierarchy links for this generation, follow the canonical relationships
    const children =
      childIds.length > 0
        ? await Entity.find({ id: childIds })
        : await Entity.find({ parent_id: parentIds });

    const parentIdsToCode = reduceToDictionary(parents, 'id', 'code');
    children.forEach(c => (c.parent_code = parentIdsToCode[c.parent_id]));

    return children;
  }

  async getDescendantsAndSelfCanonically() {
    return this.database.executeSql(
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
        SELECT
          ${Entity.getSqlForColumns('descendants')},
          p.code as parent_code
        FROM descendants
        LEFT JOIN entity p
          ON p.id = descendants.parent_id
    `,
      [this.id],
    );
  }

  /**
   * Recursively traverse the alternative hierarchy that begins with the specified parents.
   * At each generation, choose children via 'entity_relation' if any exist, or the canonical
   * entity.parent_id if none do
   * Assumptions:
   * - All entities of a given type occupy the same generation, e.g. all villages sit within a
   *   single generation below facilities. This is not true for 'region' entity types - in several
   *   countries there are two layers of district/sub-district, which are both of type 'region'.
   *   In practice, this isn't a big deal, as we generally just want the first layer we come to :-)
   * @param {string[]} parents      The entities to start at
   * @param {string} hierarchyId  The specific hierarchy to follow through entity_relation
   */
  static async getNearestDescendantsMatchingTypes(parents, hierarchyId, entityTypes) {
    const children = await Entity.getNextGeneration(parents, hierarchyId);

    // if we've made it to the leaf nodes, return an empty array
    if (children.length === 0) {
      return [];
    }

    // if we've reached the level with descendants of the correct type, return them
    const childrenOfType = children.filter(c => entityTypes.includes(c.type));
    if (childrenOfType.length > 0) {
      return childrenOfType;
    }

    // keep recursing down the hierarchy
    return Entity.getNearestDescendantsMatchingTypes(children, hierarchyId, entityTypes);
  }

  static async getFacilitiesOfOrgUnit(organisationUnitCode) {
    const entity = await Entity.getEntityByCode(organisationUnitCode);
    return entity ? entity.getDescendantsOfType(ENTITY_TYPES.FACILITY) : [];
  }

  // assumes all entities of the given type are found at the same level in the hierarchy tree
  async getDescendantsOfType(entityType, hierarchyId) {
    return Entity.getNearestDescendantsMatchingTypes([this], hierarchyId, [entityType]);
  }

  async getNearestOrgUnitDescendants(hierarchyId) {
    const validTypes = Object.values(Entity.orgUnitEntityTypes);
    return Entity.getNearestDescendantsMatchingTypes([this], hierarchyId, validTypes);
  }

  async getChildRegions() {
    return this.database.executeSql(
      `
      SELECT ${Entity.getSqlForColumns()} FROM entity
      WHERE
        region IS NOT NULL AND
        parent_id = ?;
    `,
      [this.id],
    );
  }

  static async getEntityByCode(code) {
    const records = await Entity.database.executeSql(
      `SELECT
        ${Entity.getSqlForColumns()}
      FROM entity
      WHERE
        code = ?;
      `,
      [code],
    );
    return records[0] && Entity.load(records[0]);
  }

  static async find(conditions, loadOptions, queryOptions) {
    return super.find(conditions, loadOptions, {
      ...queryOptions,
      columns: Entity.getColumnSpecs(),
    });
  }

  static async findById(id, loadOptions, queryOptions) {
    return super.findById(id, loadOptions, {
      ...queryOptions,
      columns: Entity.getColumnSpecs(),
    });
  }

  async getOrgUnitChildren() {
    const types = Object.values(Entity.orgUnitEntityTypes);

    return Entity.database.executeSql(
      `
      SELECT ${Entity.getSqlForColumns()} FROM entity
      WHERE
        parent_id = ?
        ${constructTypesCriteria(types, 'AND')}
      ORDER BY name;
    `,
      [this.id, ...types],
    );
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

  isProject() {
    return this.type === PROJECT;
  }

  async project() {
    return Project.findOne({ entity_id: this.id });
  }

  async parent() {
    return Entity.findById(this.parent_id);
  }
}
