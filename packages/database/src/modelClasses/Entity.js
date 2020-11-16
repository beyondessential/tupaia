/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { DatabaseModel } from '../DatabaseModel';
import { DatabaseType } from '../DatabaseType';
import { TYPES } from '../types';
import { QUERY_CONJUNCTIONS } from '../TupaiaDatabase';

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
const PROJECT = 'project';
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
  PROJECT,
  CITY,
};

export const ORG_UNIT_ENTITY_TYPES = {
  WORLD,
  COUNTRY,
  DISTRICT,
  SUB_DISTRICT,
  FACILITY,
  VILLAGE,
};

// reflects how org units are stored on DHIS2
const ORG_UNIT_TYPE_LEVELS = {
  [WORLD]: 1,
  [COUNTRY]: 2,
  [DISTRICT]: 3,
  [SUB_DISTRICT]: 4,
  [FACILITY]: 5,
  [VILLAGE]: 6,
};

// some entity types are just used to store data against for aggregation, and shouldn't be
// individually shown on tupaia.org
const TYPES_EXCLUDED_FROM_TUPAIA_FRONTEND = [CASE, CASE_CONTACT];

const ENTITY_RELATION_TYPE = {
  ANCESTORS: 'ancestors',
  DESCENDANTS: 'descendants',
};

export class EntityType extends DatabaseType {
  static databaseType = TYPES.ENTITY;

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  isFacility() {
    return this.type === FACILITY;
  }

  isCountry() {
    return this.type === COUNTRY;
  }

  isWorld() {
    return this.type === WORLD;
  }

  isProject() {
    return this.type === PROJECT;
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

  async countryEntity() {
    return this.model.findOne({ code: this.country_code });
  }

  async parent() {
    return this.parent_id ? this.model.findById(this.parent_id) : undefined;
  }

  async hasCountryParent() {
    const parent = await this.parent();
    return parent.type === COUNTRY;
  }

  async getAncestors(hierarchyId, criteria) {
    return this.model.getRelationsOfEntity(ENTITY_RELATION_TYPE.ANCESTORS, this.id, {
      entity_hierarchy_id: hierarchyId,
      ...criteria,
    });
  }

  async getDescendants(hierarchyId, criteria) {
    return this.model.getRelationsOfEntity(ENTITY_RELATION_TYPE.DESCENDANTS, this.id, {
      entity_hierarchy_id: hierarchyId,
      ...criteria,
    });
  }

  async getAncestorOfType(hierarchyId, entityType) {
    if (this.type === entityType) return this;
    const [ancestor] = await this.getAncestors(hierarchyId, { type: entityType });
    return ancestor;
  }

  async getDescendantsOfType(hierarchyId, entityType) {
    if (this.type === entityType) return [this];
    return this.getDescendants(hierarchyId, { type: entityType });
  }

  async getNearestOrgUnitDescendants(hierarchyId) {
    const orgUnitEntityTypes = new Set(Object.values(ORG_UNIT_ENTITY_TYPES));
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

  /**
   * Returns the id of the entity hierarchy to use by default for this entity, if none is specified.
   * Will prefer the "explore" hierarchy, but if the entity isn't a member of that, will choose
   * the first hierarchy it is a member of, alphabetically
   */
  async fetchDefaultEntityHierarchyId() {
    const hierarchiesIncludingEntity = await this.otherModels.entityHierarchy.find(
      {
        ancestor_id: this.id,
        [QUERY_CONJUNCTIONS.OR]: {
          descendant_id: this.id,
        },
      },
      {
        joinWith: TYPES.ANCESTOR_DESCENDANT_RELATION,
        sort: ['entity_hierarchy.name ASC'],
      },
    );
    if (hierarchiesIncludingEntity.length === 0) {
      throw new Error(`The entity with id ${this.id} is not included in any hierarchy`);
    }
    const exploreHierarchy = hierarchiesIncludingEntity.find(h => h.name === 'explore');
    return exploreHierarchy ? exploreHierarchy.id : hierarchiesIncludingEntity[0].id;
  }

  /**
   * Fetches the closest node in the entity hierarchy that is an organisation unit,
   * starting from the entity itself and traversing the hierarchy up
   *
   * @returns {EntityType}
   */
  async fetchNearestOrgUnitAncestor(hierarchyId) {
    const orgUnitEntityTypes = new Set(Object.values(ORG_UNIT_ENTITY_TYPES));
    // if this is an org unit, don't worry about going deeper
    if (orgUnitEntityTypes.has(this.type)) return this;
    // if no hierarchy id was passed in, default to a hierarchy this entity is a part of
    const entityHierarchyId = hierarchyId || (await this.fetchDefaultEntityHierarchyId());
    // get ancestors and return the first that is an org unit type
    // we rely on ancestors being returned in order of proximity to this entity
    const ancestors = await this.getAncestors(entityHierarchyId);
    return ancestors.find(d => orgUnitEntityTypes.has(d.type));
  }

  async getAncestorCodes(hierarchyId) {
    const ancestors = await this.getAncestors(hierarchyId);
    return ancestors.map(a => a.code);
  }

  async getChildren(hierarchyId) {
    return this.getDescendants(hierarchyId, { generational_distance: 1 });
  }

  async getChildrenViaHierarchy(hierarchyId) {
    return this.database.executeSql(
      `
        SELECT entity.*
        FROM entity
        INNER JOIN entity_relation on entity.id = entity_relation.child_id
        WHERE entity_relation.parent_id = ?
        AND entity_relation.entity_hierarchy_id = ?;
      `,
      [this.id, hierarchyId],
    );
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

  // Some cached functions within Entity need to be invalidated if an entity relation is changed,
  // and therefore the hierarchy cache has been rebuilt.
  // Note: we don't use ancestor_descendant_relation as the dependency, as adding change triggers
  // to that table slows down the rebuilds considerably (40s -> 200s for full initial build)
  get cacheDependencies() {
    return [TYPES.ENTITY_RELATION];
  }

  customColumnSelectors = {
    region: fieldName => `ST_AsGeoJSON(${fieldName})`,
    point: fieldName => `ST_AsGeoJSON(${fieldName})`,
    bounds: fieldName => `ST_AsGeoJSON(${fieldName})`,
  };

  orgUnitEntityTypes = ORG_UNIT_ENTITY_TYPES;

  types = ENTITY_TYPES;

  typesExcludedFromWebFrontend = TYPES_EXCLUDED_FROM_TUPAIA_FRONTEND;

  isOrganisationUnitType = type => Object.values(ORG_UNIT_ENTITY_TYPES).includes(type);

  async updatePointCoordinates(code, { longitude, latitude }) {
    const point = JSON.stringify({
      coordinates: [longitude, latitude],
      type: 'Point',
    });
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

  async fetchAncestorDetailsByDescendantCode(descendantCodes, hierarchyId, ancestorType) {
    const cacheKey = this.getCacheKey(this.fetchAncestorDetailsByDescendantCode.name, arguments);
    return this.runCachedFunction(cacheKey, async () => {
      const ancestorDescendantRelations = await this.database.executeSqlInBatches(
        descendantCodes,
        batchOfDescendantCodes => [
          `
          SELECT descendant.code as descendant_code, ancestor.code as ancestor_code, ancestor.name as ancestor_name
          FROM
            ancestor_descendant_relation
          JOIN
            entity as ancestor on ancestor.id = ancestor_descendant_relation.ancestor_id
          JOIN
            entity as descendant ON descendant.id = ancestor_descendant_relation.descendant_id
          WHERE
            descendant.code IN (${batchOfDescendantCodes.map(() => '?').join(',')})
          AND
            ancestor_descendant_relation.entity_hierarchy_id = ?
          AND
            ancestor.type = ?
          ORDER BY
            generational_distance ASC
        `,
          [...batchOfDescendantCodes, hierarchyId, ancestorType],
        ],
      );
      const ancestorDetailsByDescendantCode = {};
      ancestorDescendantRelations.forEach(r => {
        ancestorDetailsByDescendantCode[r.descendant_code] = {
          code: r.ancestor_code,
          name: r.ancestor_name,
        };
      });
      return ancestorDetailsByDescendantCode;
    });
  }

  async getRelationsOfEntity(ancestorsOrDescendants, entityId, criteria) {
    const cacheKey = this.getCacheKey(this.getRelationsOfEntity.name, arguments);
    const [joinTablesOn, filterByEntityId] =
      ancestorsOrDescendants === ENTITY_RELATION_TYPE.ANCESTORS
        ? ['ancestor_id', 'descendant_id']
        : ['descendant_id', 'ancestor_id'];
    return this.runCachedFunction(cacheKey, async () =>
      this.find(
        {
          ...criteria,
          [filterByEntityId]: entityId,
        },
        {
          joinWith: TYPES.ANCESTOR_DESCENDANT_RELATION,
          joinCondition: ['entity.id', joinTablesOn],
          sort: ['generational_distance ASC'],
        },
      ),
    );
  }

  getDhisLevel(type) {
    const level = ORG_UNIT_TYPE_LEVELS[type];
    if (!level) {
      throw new Error(`${type} is not an organisational unit type`);
    }

    return level;
  }
}
