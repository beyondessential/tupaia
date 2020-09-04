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

const DEFAULT_ENTITY_HIERARCHY = 'explore';

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

const ENTITY_TYPES = {
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
};

export const ORG_UNIT_ENTITY_TYPES = {
  WORLD,
  COUNTRY,
  DISTRICT,
  SUB_DISTRICT,
  FACILITY,
  VILLAGE,
};

const ANCESTORS = 'ancestors';
const DESCENDANTS = 'descendants';

class EntityType extends DatabaseType {
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

  async getAncestors(hierarchyId, ancestorEntityType, parentOnly) {
    return this.model.getAncestorsOfEntity(this.id, hierarchyId, ancestorEntityType, parentOnly);
  }

  async getDescendants(hierarchyId, descendantEntityType, childrenOnly) {
    return this.model.getDescendantsOfEntity(
      this.id,
      hierarchyId,
      descendantEntityType,
      childrenOnly,
    );
  }

  async getAncestorOfType(entityType, hierarchyId) {
    if (this.type === entityType) return this;
    const [ancestor] = await this.getAncestors(hierarchyId, entityType);
    return ancestor;
  }

  async getDescendantsOfType(entityType, hierarchyId) {
    if (this.type === entityType) return [this];
    return this.getDescendants(hierarchyId, entityType);
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

  async fetchDefaultEntityHierarchyId() {
    const hierarchy = await this.otherModels.entityHierarchy.findOne({
      name: DEFAULT_ENTITY_HIERARCHY,
    });
    return hierarchy.id;
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
    if (orgUnitEntityTypes.has(this.type)) return [this];
    // if no hierarchy id was passed in, use the default hierarchy
    const entityHierarchyId = hierarchyId || (await this.fetchDefaultEntityHierarchyId());
    // get ancestors and return the first that is an org unit type
    // we rely on ancestors being returned in order of proximity to this entity
    const ancestors = await this.getAncestors(entityHierarchyId);
    return ancestors.find(d => orgUnitEntityTypes.has(d.type));
  }
}

export class EntityModel extends DatabaseModel {
  get DatabaseTypeClass() {
    return EntityType;
  }

  orgUnitEntityTypes = ORG_UNIT_ENTITY_TYPES;

  types = ENTITY_TYPES;

  isOrganisationUnitType = type => Object.values(ORG_UNIT_ENTITY_TYPES).includes(type);

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

  async fetchAncestorDetailsByDescendantCode(...args) {
    const cacheKey = `fetchAncestorDetailsByDescendantCode:${JSON.stringify(args)}`;
    const [descendantCodes, hierarchyId, ancestorType] = args;
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
            ancestor_descendant_relation.hierarchy_id = ?
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

  async getRelationsOfEntity(...args) {
    const cacheKey = `getRelationsOfEntity:${JSON.stringify(args)}`;
    const [
      entityId,
      hierarchyId,
      ancestorsOrDescendants,
      entityTypeOfRelations,
      immediateRelativesOnly,
    ] = args;
    const [joinTablesOn, filterByEntityId] =
      ancestorsOrDescendants === ANCESTORS
        ? ['ancestor_id', 'descendant_id']
        : ['descendant_id', 'ancestor_id'];
    return this.runCachedFunction(cacheKey, async () =>
      this.findWithSql(
        `
        SELECT entity.*
        FROM
          entity
        JOIN
          ancestor_descendant_relation ON entity.id = ${joinTablesOn}
        WHERE
          ${filterByEntityId} = ?
        AND
          hierarchy_id = ?
        ${
          entityTypeOfRelations
            ? `
        AND
          entity.type = ?
        `
            : ''
        }
        ${
          immediateRelativesOnly
            ? `
        AND
          generational_distance = 1
        `
            : ''
        }
        ORDER BY
          generational_distance ASC
        ;
      `,
        [entityId, hierarchyId, entityTypeOfRelations].filter(p => !!p),
      ),
    );
  }

  async getAncestorsOfEntity(entityId, hierarchyId, ancestorEntityType, parentOnly) {
    return this.getRelationsOfEntity(
      entityId,
      hierarchyId,
      ANCESTORS,
      ancestorEntityType,
      parentOnly,
    );
  }

  async getDescendantsOfEntity(entityId, hierarchyId, descendantEntityType, childrenOnly) {
    return this.getRelationsOfEntity(
      entityId,
      hierarchyId,
      DESCENDANTS,
      descendantEntityType,
      childrenOnly,
    );
  }
}
