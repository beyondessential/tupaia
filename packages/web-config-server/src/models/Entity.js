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
const SCHOOL = 'school';
const SUB_DISTRICT = 'sub_district';
const CATCHMENT = 'catchment';
const SUB_CATCHMENT = 'sub_catchment';
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
  SCHOOL,
  SUB_DISTRICT,
  CATCHMENT,
  SUB_CATCHMENT,
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
    'attributes',
  ];

  // a set of basic fields so that entities used for search etc. can be as light as possible
  static minimalFields = ['id', 'code', 'type', 'parent_id', 'country_code', 'name'];

  static geoFields = ['point', 'region', 'bounds'];

  static getColumnSpecs = tableAlias => {
    return this.buildColumnSpecs(tableAlias, false);
  };

  static buildColumnSpecs = tableAlias => {
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
   * Fetch all ancestors of the current entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestors of
   */
  async getAncestors(hierarchyId) {
    return Entity.hierarchyBuilder.getAncestors(this.id, hierarchyId);
  }

  /**
   * Fetch the codes of all ancestors of the current entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestor codes of
   */
  async getAncestorCodes(hierarchyId) {
    const ancestors = await this.getAncestors(hierarchyId);
    return ancestors.map(({ code }) => code);
  }

  async getCountry(hierarchyId) {
    if (this.isCountry()) return this;
    return this.getAncestorOfType(COUNTRY, hierarchyId);
  }

  async getChildren(hierarchyId) {
    return Entity.hierarchyBuilder.getChildren(this.id, hierarchyId);
  }

  async getDescendants(hierarchyId) {
    return Entity.hierarchyBuilder.getDescendants(this.id, hierarchyId);
  }

  static async getFacilitiesOfOrgUnit(organisationUnitCode) {
    const entity = await Entity.findOne({ code: organisationUnitCode });
    return entity ? entity.getDescendantsOfType(ENTITY_TYPES.FACILITY) : [];
  }

  async getAncestorOfType(entityType, hierarchyId) {
    if (this.type === entityType) return this;
    const ancestors = await this.getAncestors(hierarchyId);
    return ancestors.find(ancestor => ancestor.type === entityType);
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
    const nearestOrgUnitDescendant = descendants.find(d => orgUnitEntityTypes.has(d.type));
    if (!nearestOrgUnitDescendant) {
      return [];
    }
    return descendants.filter(d => d.type === nearestOrgUnitDescendant.type);
  }

  static async findOne(conditions, loadOptions, queryOptions) {
    return super.findOne(conditions, loadOptions, {
      columns: Entity.getColumnSpecs(),
      ...queryOptions, // columns can be overridden by client
    });
  }

  static async find(conditions, loadOptions, queryOptions) {
    return super.find(conditions, loadOptions, {
      columns: Entity.getColumnSpecs(),
      ...queryOptions, // columns can be overridden by client
    });
  }

  static async findById(id, loadOptions, queryOptions) {
    return super.findById(id, loadOptions, {
      columns: Entity.getColumnSpecs(),
      ...queryOptions, // columns can be overridden by client
    });
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
    return this.parentId ? Entity.findById(this.parent_id) : undefined;
  }

  async countryEntity() {
    if (this.type === COUNTRY) {
      return this;
    } else if (this.country_code) {
      return Entity.findOne({ code: this.country_code });
    }
    return undefined;
  }
}
