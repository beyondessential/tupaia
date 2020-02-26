/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { capital } from 'case';
import groupBy from 'lodash.groupby';

import { TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import { BaseModel } from './BaseModel';

const FACILITY = 'facility';
const REGION = 'region';
const COUNTRY = 'country';
const WORLD = 'world';
const CASE = 'case';
const DISASTER = 'disaster';
const VILLAGE = 'village';

export const ENTITY_TYPES = {
  FACILITY,
  REGION,
  COUNTRY,
  WORLD,
  CASE,
  DISASTER,
  VILLAGE,
};

export const ORG_UNIT_ENTITY_TYPES = {
  FACILITY,
  REGION,
  COUNTRY,
  WORLD,
};

const ORG_UNIT_TYPE_LIST = Object.values(ORG_UNIT_ENTITY_TYPES);

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

  static async getAllDescendants(id, types = []) {
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
          children.code
        FROM children
        WHERE
          children.type = ?;
    `,
      [code, FACILITY],
    );
  }

  static async getAllDescendantsWithCoordinates(code) {
    return Entity.database.executeSql(
      `
      WITH RECURSIVE children AS (
        SELECT id, code, country_code, name, image_url, parent_id, point, bounds, region, type, 0 AS generation
        FROM   entity
        WHERE  code = ?
        UNION  ALL
        SELECT p.id, p.code, p.country_code, p.name, p.image_url, p.parent_id, p.point, p.bounds, p.region, p.type, c.generation + 1
        FROM   children      c
        JOIN   entity p ON p.parent_id = c.id
      )
      SELECT
        children.id,
        children.code,
        children.country_code,
        children.name,
        children.image_url,
        p.code as parent_code,
        ST_AsGeoJSON(children.point) as point,
        ST_AsGeoJSON(children.bounds) as bounds,
        (children.region IS NOT NULL) as has_region,
        children.type,
        c.category_code as clinic_category_code,
        c.type_name as clinic_type_name
      FROM children
      left join entity p
      	on p.id = children.parent_id 
      LEFT JOIN clinic c
        ON c.code = children.code
    `,
      [code],
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
        e.id,
        e.code,
        e.country_code,
        e.name,
        e.image_url,
        e.parent_id,
        ST_AsGeoJSON(e.point) as point,
        ST_AsGeoJSON(e.bounds) as bounds,
        (region IS NOT NULL) as has_region,
        e.type,
        c.category_code as clinic_category_code,
        c.type_name as clinic_type_name
      FROM entity e
      LEFT JOIN clinic c
          ON c.code = e.code
      WHERE
        e.code = ?;
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
    return Entity.getAllDescendants(this.id, [entityType]);
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
