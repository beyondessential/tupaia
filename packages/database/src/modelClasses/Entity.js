/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';

/**
 * TODO: This version of Entity.js comes from meditrak-server, which does not include any of the
 * a) alternative hierarchy logic, or b) optimisations that are in the version in web-config-server
 * https://github.com/beyondessential/tupaia-backlog/issues/427
 */

/**
 * Maximum number of parents an entity can have.
 * Used to avoid infinite loops while traversing the entity hierarchy
 */
const MAX_ENTITY_HIERARCHY_LEVELS = 100;

const CASE = 'case';
const CASE_CONTACT = 'case_contact';
const COUNTRY = 'country';
const DISASTER = 'disaster';
const DISTRICT = 'district';
const FACILITY = 'facility';
const FIELD_STATION = 'field_station';
const SCHOOL = 'school';
const SUB_DISTRICT = 'sub_district';
const CATCHMENT = 'catchment';
const SUB_CATCHMENT = 'sub_catchment';
const VILLAGE = 'village';
const WORLD = 'world';
const CITY = 'city';

const ENTITY_TYPES = {
  CASE,
  CASE_CONTACT,
  COUNTRY,
  DISASTER,
  DISTRICT,
  FACILITY,
  FIELD_STATION,
  SCHOOL,
  SUB_DISTRICT,
  CATCHMENT,
  SUB_CATCHMENT,
  VILLAGE,
  WORLD,
  CITY,
};

const ORG_UNIT_ENTITY_TYPES = {
  WORLD,
  COUNTRY,
  DISTRICT,
  SUB_DISTRICT,
  FACILITY,
  VILLAGE,
};

export class EntityType extends DatabaseType {
  static databaseType = TYPES.ENTITY;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  async country() {
    return this.otherModels.country.findOne({ code: this.country_code });
  }

  isFacility() {
    return this.type === FACILITY;
  }

  isWorld() {
    return this.type === WORLD;
  }

  isOrganisationUnit() {
    return Object.values(ORG_UNIT_ENTITY_TYPES).includes(this.type);
  }

  isTrackedEntity() {
    return !this.isOrganisationUnit();
  }

  getDhisId() {
    return this.metadata && this.metadata.dhis && this.metadata.dhis.id;
  }

  async setDhisId(dhisId) {
    if (!this.metadata) {
      this.metadata = {};
    }
    if (!this.metadata.dhis) {
      this.metadata.dhis = {};
    }
    this.metadata.dhis.id = dhisId;
    return this.save();
  }

  hasDhisId() {
    return !!this.getDhisId();
  }

  async fetchParent() {
    return this.model.findById(this.parent_id);
  }

  async hasCountryParent() {
    const parent = await this.fetchParent();
    return parent.type === COUNTRY;
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

  pointLatLon() {
    const pointJson = JSON.parse(this.point);
    return {
      lat: pointJson.coordinates[1],
      lon: pointJson.coordinates[0],
    };
  }
}

export class EntityModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityType;
  }

  static fields = [
    'id',
    'code',
    'parent_id',
    'name',
    'type',
    'point',
    'region',
    'image_url',
    'country_code',
    'bounds',
    'metadata',
    'image_url',
    'attributes',
  ];

  static geoFields = ['point', 'region', 'bounds'];

  orgUnitEntityTypes = ORG_UNIT_ENTITY_TYPES;

  types = ENTITY_TYPES;

  isOrganisationUnitType = type => Object.values(ORG_UNIT_ENTITY_TYPES).includes(type);

  getColumnSpecs = tableAlias => {
    return this.buildColumnSpecs(tableAlias, false);
  };

  buildColumnSpecs = tableAlias => {
    const tableAliasPrefix = tableAlias ? `${tableAlias}.` : '';
    return EntityModel.fields.map(field => {
      if (EntityModel.geoFields.includes(field)) {
        return { [field]: `ST_AsGeoJSON(${tableAliasPrefix}${field})` };
      }
      return { [field]: `${tableAliasPrefix}${field}` };
    });
  };

  async findOne(conditions) {
    return super.findOne(conditions, {
      columns: this.getColumnSpecs(),
    });
  }

  async find(conditions) {
    return super.find(conditions, {
      columns: this.getColumnSpecs(),
    });
  }

  async findById(id) {
    return super.findById(id, {
      columns: this.getColumnSpecs(),
    });
  }

  async update(whereCondition, fieldsToUpdate) {
    return super.update(whereCondition, this.removeUnUpdatableFields(fieldsToUpdate));
  }

  async updateOrCreate(whereCondition, fieldsToUpsert) {
    return super.updateOrCreate(whereCondition, this.removeUnUpdatableFields(fieldsToUpsert));
  }

  async updateById(id, fieldsToUpdate) {
    return super.updateById(id, this.removeUnUpdatableFields(fieldsToUpdate));
  }

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

  /**
   * @private
   */
  removeUnUpdatableFields(fields) {
    const filteredFields = {};
    for (const key of Object.keys(fields)) {
      if (EntityModel.geoFields.indexOf(key) !== -1) {
        continue;
      }
      filteredFields[key] = fields[key];
    }
    return filteredFields;
  }
}
