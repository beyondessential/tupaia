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
import { AncestorDescendantRelation } from './AncestorDescendantRelation';

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

  /**
   * Fetch all ancestors of the current entity, by default excluding 'World'
   * @param {string} id The id of the entity to fetch ancestors of
   */
  async getAncestors(hierarchyId, criteria = {}) {
    const ancestorIds = await AncestorDescendantRelation.getAncestorIds(this.id, hierarchyId);
    return Entity.find({ id: ancestorIds, ...criteria });
  }

  async getDescendants(hierarchyId, criteria = {}) {
    const descendantIds = await AncestorDescendantRelation.getDescendantIds(this.id, hierarchyId);
    return Entity.find({ id: descendantIds, ...criteria });
  }

  async getAncestorOfType(entityType, hierarchyId) {
    if (this.type === entityType) return this;
    const [ancestor] = await this.getAncestors(hierarchyId, { type: entityType });
    return ancestor;
  }

  // assumes all entities of the given type are found at the same level in the hierarchy tree
  async getDescendantsOfType(hierarchyId, entityType) {
    if (this.type === entityType) return [this];
    return this.getDescendants(hierarchyId, { type: entityType });
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
    return pascal(this.type); // sub_district -> SubDistrict
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
}
