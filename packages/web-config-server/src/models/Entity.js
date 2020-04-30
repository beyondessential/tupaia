/**
 * Tupaia Config Server
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 **/

import { pascal } from 'case';

import { TYPES } from '@tupaia/database';
import { reduceToDictionary } from '@tupaia/utils';
import {
  translateBoundsForFrontend,
  translatePointForFrontend,
  translateRegionForFrontend,
} from '/utils/geoJson';
import { BaseModel } from './BaseModel';
import { EntityRelation } from './EntityRelation';
import { Project } from './Project';
import { EntityHierarchyBuilder } from './helpers/EntityHierarchyBuilder';

const CASE = 'case';
const CASE_CONTACT = 'case_contact';
const COUNTRY = 'country';
const DISASTER = 'disaster';
const DISTRICT = 'district';
const FACILITY = 'facility';
const SUB_DISTRICT = 'sub_district';
const VILLAGE = 'village';
const WORLD = 'world';
const PROJECT = 'project';

export const ENTITY_TYPES = {
  CASE,
  CASE_CONTACT,
  COUNTRY,
  DISASTER,
  DISTRICT,
  FACILITY,
  SUB_DISTRICT,
  VILLAGE,
  WORLD,
  PROJECT,
};

const ORG_UNIT_TYPE_LEVELS = {
  [WORLD]: 1,
  [COUNTRY]: 2,
  [DISTRICT]: 3,
  [SUB_DISTRICT]: 4,
  [FACILITY]: 5,
  [VILLAGE]: 6,
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
      }
      return { [field]: `${tableAliasPrefix}${field}` };
    });
  };

  static getSqlForColumns = tableAlias =>
    Entity.getColumnSpecs(tableAlias).map(columnSpec => {
      const [fieldAlias, selector] = Object.entries(columnSpec)[0];
      return `${selector} as ${fieldAlias}`;
    });

  static FACILITY = FACILITY;

  static COUNTRY = COUNTRY;

  static DISTRICT = DISTRICT;

  static SUB_DISTRICT = SUB_DISTRICT;

  static DISASTER = DISASTER;

  static WORLD = WORLD;

  static orgUnitEntityTypes = {
    WORLD,
    COUNTRY,
    DISTRICT,
    SUB_DISTRICT,
    FACILITY,
    VILLAGE,
  };

  static hierarchyBuilder = new EntityHierarchyBuilder(Entity, EntityRelation);

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

  async getDescendants(hierarchyId) {
    return Entity.hierarchyBuilder.getDescendants(this.id, hierarchyId);
  }

  async getFacilities(hierarchyId) {
    return this.getDescendantsOfType(ENTITY_TYPES.FACILITY, hierarchyId);
  }

  static async getFacilitiesOfOrgUnit(organisationUnitCode) {
    const entity = await Entity.findOne({ code: organisationUnitCode });
    return entity ? entity.getFacilities() : [];
  }

  async getOrgUnitDescendants() {
    const types = Object.values(Entity.orgUnitEntityTypes);
    const descendants = await this.getDescendants();
    return descendants.filter(entity => types.includes(entity.type));
  }

  // assumes all entities of the given type are found at the same level in the hierarchy tree
  async getDescendantsOfType(entityType, hierarchyId) {
    if (this.type === entityType) return [this];
    const descendants = await this.getDescendants(hierarchyId);
    return descendants.filter(d => d.type === entityType);
  }

  async getNearestOrgUnitDescendants(hierarchyId) {
    const orgUnitEntityTypes = new Set(Object.values(Entity.orgUnitEntityTypes));
    // if this is an org unit, don't worry about going deeper
    if (orgUnitEntityTypes.has(this.type)) return [this];

    // get descendants and return all of the first type that is an org unit type
    // we rely on descendants being returned in order, with those higher in the hierarchy first
    const descendants = await this.getDescendants(hierarchyId);
    const nearestOrgUnitType = descendants.find(d => orgUnitEntityTypes.has(d.type)).type;
    return descendants.filter(d => d.type === nearestOrgUnitType);
  }

  static async findOne(conditions, loadOptions, queryOptions) {
    return super.findOne(conditions, loadOptions, {
      ...queryOptions,
      columns: Entity.getColumnSpecs(),
    });
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

    const records = await Entity.database.executeSql(
      `
      SELECT ${Entity.getSqlForColumns()} FROM entity
      WHERE
        parent_id = ?
        ${constructTypesCriteria(types, 'AND')}
      ORDER BY name;
    `,
      [this.id, ...types],
    );
    return records.map(record => Entity.load(record));
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

  static getDhisLevel(type) {
    const level = ORG_UNIT_TYPE_LEVELS[type];
    if (!level) {
      throw new Error(`${type} is not an organisational unit type`);
    }

    return level;
  }

  getOrganisationLevel() {
    return pascal(this.type); // sub_district -> SubDistrict
  }

  async buildDisplayName() {
    const ancestors = await this.getAllAncestors();
    return ancestors
      .reverse()
      .map(ancestor => ancestor.name)
      .join(', ');
  }

  isCountry() {
    return this.type === COUNTRY;
  }

  static translateTypeForFrontend = type => pascal(type);

  translateForFrontend() {
    return {
      type: Entity.translateTypeForFrontend(this.type),
      organisationUnitCode: this.code,
      countryCode: this.country_code,
      name: this.name,
      location: this.translateLocationForFrontend(),
      photoUrl: this.image_url,
    };
  }

  translateLocationForFrontend() {
    const { point, region, bounds } = this;

    const type = (() => {
      if (region) return 'area';
      if (point) return 'point';
      return 'no-coordinates';
    })();

    return {
      type,
      point: translatePointForFrontend(point),
      bounds: translateBoundsForFrontend(bounds),
      region: translateRegionForFrontend(region),
    };
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

  async countryEntity() {
    return this.type === COUNTRY ? this : Entity.findOne({ code: this.country_code });
  }
}
