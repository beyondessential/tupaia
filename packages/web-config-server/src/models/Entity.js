/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { capital } from 'case';
import tail from 'lodash.tail';

import { TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import { BaseModel } from './BaseModel';

const CASE = 'case';
const COUNTRY = 'country';
const DISASTER = 'disaster';
const FACILITY = 'facility';
const REGION = 'region';
const VILLAGE = 'village';
const WORLD = 'world';

export const ENTITY_TYPES = {
  CASE,
  COUNTRY,
  DISASTER,
  FACILITY,
  REGION,
  VILLAGE,
  WORLD,
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

  static translatedFields = (alias = 'entity') =>
    Entity.fields.map(field =>
      Entity.geoFields.includes(field)
        ? `ST_AsGeoJSON(${alias}.${field}) as ${field}`
        : `${alias}.${field}`,
    );

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

  async getDescendants() {
    return tail(await this.getDescendantsAndSelf());
  }

  async getDescendantsAndSelf() {
    return this.database.executeSql(
      `
        WITH RECURSIVE descendants AS (
          SELECT *, 0 AS generation
            FROM entity
            WHERE code = ?

          UNION ALL
          SELECT c.*, d.generation + 1
            FROM descendants d
            JOIN entity c ON c.parent_id = d.id
        )
        SELECT
          ${Entity.translatedFields('descendants')},
          p.code as parent_code
        FROM descendants
        LEFT JOIN entity p
          ON p.id = descendants.parent_id
    `,
      [this.code],
    );
  }

  static async getEntityByCode(code) {
    const records = await Entity.database.executeSql(
      `SELECT 
        ${Entity.translatedFields()}
      FROM entity
      WHERE
        code = ?;
      `,
      [code],
    );
    return records[0] && Entity.load(records[0]);
  }

  static async findById(id, loadOptions, queryOptions) {
    // Check for usage of incompatible params defined in the parent class method signature
    if (loadOptions) {
      throw new Error('"loadOptions" parameter is not supported by Entity.findById()');
    }
    if (queryOptions) {
      throw new Error('"queryOptions" parameter is not supported by Entity.findById()');
    }

    const records = await Entity.database.executeSql(
      `SELECT ${Entity.translatedFields()} FROM entity WHERE id = ?;`,
      [id],
    );
    return records[0] && Entity.load(records[0]);
  }

  async getOrgUnitChildren() {
    const types = Object.values(Entity.orgUnitEntityTypes);

    return Entity.database.executeSql(
      `
      SELECT ${Entity.translatedFields()} FROM entity
      WHERE
        parent_id = ?
        ${constructTypesCriteria(types, 'AND')}
      ORDER BY name;
    `,
      [this.id, ...types],
    );
  }

  static async getFacilitiesOfOrgUnit(organisationUnitCode) {
    const entity = await Entity.getEntityByCode(organisationUnitCode);
    return entity ? entity.getDescendantsOfType(ENTITY_TYPES.FACILITY) : [];
  }

  async getDescendantsOfType(entityType) {
    return (await this.getDescendants()).filter(descendant => descendant.type === entityType);
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

  async parent() {
    return Entity.findById(this.parent_id);
  }
}
