/**
 * Tupaia MediTrak
 * Copyright (c) 2017 Beyond Essential Systems Pty Ltd
 **/

import { get, set } from 'lodash';

import { DatabaseModel, DatabaseType, TYPES } from '@tupaia/database';
/**
 * Maximum number of parents an entity can have.
 * Used to avoid infinite loops while traversing the entity hierarchy
 */
export const MAX_ENTITY_HIERARCHY_LEVELS = 100;

const CASE = 'case';
const CASE_CONTACT = 'case_contact';
const COUNTRY = 'country';
const DISASTER = 'disaster';
const DISTRICT = 'district';
const FACILITY = 'facility';
const SCHOOL = 'school';
const SUB_DISTRICT = 'sub_district';
const VILLAGE = 'village';
const WORLD = 'world';

export const ENTITY_TYPES = {
  CASE,
  CASE_CONTACT,
  COUNTRY,
  DISASTER,
  DISTRICT,
  FACILITY,
  SCHOOL,
  SUB_DISTRICT,
  VILLAGE,
  WORLD,
};

export const ORG_UNIT_ENTITY_TYPES = {
  WORLD,
  COUNTRY,
  DISTRICT,
  SUB_DISTRICT,
  FACILITY,
  VILLAGE,
};

/**
 * @param {string} type
 * @param {boolean}
 */
export const isOrganisationUnitType = type => Object.values(ORG_UNIT_ENTITY_TYPES).includes(type);

/**
 * @param {Object<string, any>} data
 * @returns {(string|undefined)}
 */
export const getDhisIdFromEntityData = data => get(data, 'metadata.dhis.id');

class EntityType extends DatabaseType {
  static databaseType = TYPES.ENTITY;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  async country() {
    return this.otherModels.country.findOne({ code: this.country_code });
  }

  isOrganisationUnit() {
    return isOrganisationUnitType(this.type);
  }

  isTrackedEntity() {
    return !this.isOrganisationUnit();
  }

  getDhisId() {
    return getDhisIdFromEntityData(this);
  }

  async setDhisId(dhisId) {
    set(this, 'metadata.dhis.id', dhisId);
    return this.save();
  }

  hasDhisId() {
    return !!this.getDhisId();
  }

  async fetchParent() {
    return this.otherModels.entity.findById(this.parent_id);
  }

  async hasCountryParent() {
    const parent = await this.fetchParent();
    return parent.type === COUNTRY;
  }

  async country() {
    return this.otherModels.country.findOne({ code: this.country_code });
  }

  /**
   * Fetches the closest node in the entity hierarchy that is an organisation unit,
   * starting from the entity itself and traversing the hierarchy up
   *
   * @returns {EntityType}
   * @throws {Error}
   */
  async fetchClosestOrganisationUnit() {
    let currentEntity = this;
    for (let i = 0; i < MAX_ENTITY_HIERARCHY_LEVELS; i++) {
      if (currentEntity.isOrganisationUnit()) {
        return currentEntity;
      }

      currentEntity = await currentEntity.fetchParent();
    }

    throw new Error(`Maximum of (${MAX_ENTITY_HIERARCHY_LEVELS}) entity hierarchy levels reached`);
  }
}

export class EntityModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityType;
  }

  meditrakConfig = {
    ignorableFields: ['region', 'bounds'],
    minAppVersion: '1.7.102',
  };

  orgUnitEntityTypes = ORG_UNIT_ENTITY_TYPES;

  async updatePointCoordinates(code, { longitude, latitude }) {
    const point = JSON.stringify({ coordinates: [longitude, latitude], type: 'Point' });
    await this.updatePointCoordinatesFormatted(code, point);
  }

  async updatePointCoordinatesFormatted(code, point) {
    return this.database.executeSql(
      `
        UPDATE "entity"
        SET
          point = ST_GeomFromGeoJSON(?),
          bounds = ST_Expand(ST_Envelope(ST_GeomFromGeoJSON(?)::geometry), 1)
        WHERE code = ?;
      `,
      [point, point, code],
    );
  }

  async updateBoundsCoordinates(code, bounds) {
    return this.database.executeSql(
      `
        UPDATE "entity"
        SET "bounds" = ?
        WHERE "code" = ?;
      `,
      [bounds, code],
    );
  }

  async updateRegionCoordinates(code, geojson) {
    const shouldSetBounds =
      (
        await this.find({
          code,
          bounds: null,
        })
      ).length > 0;
    const boundsString = shouldSetBounds
      ? ', "bounds" =  ST_Envelope(ST_GeomFromGeoJSON(?)::geometry)'
      : '';

    return this.database.executeSql(
      `
        UPDATE "entity"
        SET "region" = ST_GeomFromGeoJSON(?) ${boundsString}
        WHERE "code" = ?;
      `,
      shouldSetBounds ? [geojson, geojson, code] : [geojson, code],
    );
  }
}
