/**
 * @typedef {import('@tupaia/types').Entity} Entity
 * @typedef {import('@tupaia/types').EntityHierarchy} EntityHierarchy
 * @typedef {import('@tupaia/types').EntityPolygon} EntityPolygon
 * @typedef {import('@tupaia/types').Project} Project
 */

import { uniqBy } from 'es-toolkit';
import { SyncDirections } from '@tupaia/constants';
import { assertIsNotNullish } from '@tupaia/tsutils';
import { EntityTypeEnum } from '@tupaia/types';
import { fetchPatiently, translateBounds, translatePoint, translateRegion } from '@tupaia/utils';
import { QUERY_CONJUNCTIONS } from '../BaseDatabase';
import { DatabaseRecord } from '../DatabaseRecord';
import { SqlQuery } from '../SqlQuery';
import { MaterializedViewLogDatabaseModel } from '../analytics';
import { RECORDS } from '../records';
import { buildSyncLookupSelect } from '../sync';

// NOTE: These hard coded entity types are now a legacy pattern
// Users can now create their own entity types
// The up-to-date list of entity types can be found by calling
// entityModel.getEntityTypes()
/** @deprecated */
const CASE = 'case';
/** @deprecated */
const CASE_CONTACT = 'case_contact';
/** @deprecated */
const COUNTRY = 'country';
/** @deprecated */
const DISTRICT = 'district';
/** @deprecated */
const FACILITY = 'facility';
/** @deprecated */
const SUB_FACILITY = 'sub_facility';
/** @deprecated */
const FIELD_STATION = 'field_station';
/** @deprecated */
const LARVAL_HABITAT = 'larval_habitat';
/** @deprecated */
const INDIVIDUAL = 'individual';
/** @deprecated */
const SCHOOL = 'school';
/** @deprecated */
const SUB_DISTRICT = 'sub_district';
/** @deprecated */
const CATCHMENT = 'catchment';
/** @deprecated */
const SUB_CATCHMENT = 'sub_catchment';
/** @deprecated */
const VILLAGE = 'village';
/** @deprecated */
const HOUSEHOLD = 'household';
/** @deprecated */
const WORLD = 'world';
/** @deprecated */
const PROJECT = 'project';
/** @deprecated */
const CITY = 'city';
/** @deprecated */
const POSTCODE = 'postcode';
/** @deprecated */
const LOCAL_GOVERNMENT = 'local_government';
/** @deprecated */
const MEDICAL_AREA = 'medical_area';
/** @deprecated */
const NURSING_ZONE = 'nursing_zone';
/** @deprecated */
const FETP_GRADUATE = 'fetp_graduate';

// Note: if a new type is not included in `ORG_UNIT_ENTITY_TYPES`, but data is to be stored against
// it on DHIS2, a corresponding tracked entity type must be created in DHIS2
const ENTITY_TYPES = /** @type {const} */ ({
  CASE,
  CASE_CONTACT,
  COUNTRY,
  DISTRICT,
  FACILITY,
  SUB_FACILITY,
  FIELD_STATION,
  LARVAL_HABITAT,
  INDIVIDUAL,
  SCHOOL,
  SUB_DISTRICT,
  CATCHMENT,
  SUB_CATCHMENT,
  VILLAGE,
  HOUSEHOLD,
  WORLD,
  PROJECT,
  CITY,
  POSTCODE,
  LOCAL_GOVERNMENT,
  MEDICAL_AREA,
  NURSING_ZONE,
  FETP_GRADUATE,
});

export const ORG_UNIT_ENTITY_TYPES = /** @type {const} */ ({
  WORLD,
  COUNTRY,
  DISTRICT,
  SUB_DISTRICT,
  FACILITY,
  VILLAGE,
});

// reflects how org units are stored on DHIS2
const ORG_UNIT_TYPE_LEVELS = /** @type {const} */ ({
  [WORLD]: 1,
  [COUNTRY]: 2,
  [DISTRICT]: 3,
  [SUB_DISTRICT]: 4,
  [FACILITY]: 5,
  [VILLAGE]: 6,
});

export const ENTITY_RELATION_TYPE = /** @type {const} */ ({
  ANCESTORS: 'ancestors',
  DESCENDANTS: 'descendants',
});

export class EntityRecord extends DatabaseRecord {
  static databaseRecord = RECORDS.ENTITY;

  /** @privateRemarks Does nothing meaningful runtime, but provides type hints to TypeScript */
  constructor(...args) {
    super(...args);
    /** @type {Entity['metadata']} */ this.metadata;
    /** @type {Entity['type']} */ this.type;
  }

  // Exposed for access policy creation.
  get organisationUnitCode() {
    return this.code;
  }

  isFacility() {
    return this.type === EntityTypeEnum.facility;
  }

  isCountry() {
    return this.type === EntityTypeEnum.country;
  }

  isWorld() {
    return this.type === EntityTypeEnum.world;
  }

  /**
   * @returns {boolean} If the entity is a project
   */
  isProject() {
    return this.type === EntityTypeEnum.project;
  }

  isOrganisationUnit() {
    return Object.values(ORG_UNIT_ENTITY_TYPES).includes(this.type);
  }

  isTrackedEntity() {
    return !this.isOrganisationUnit();
  }

  // returns the dhis id if exists, or waits some time for it to be populated
  async getDhisTrackedEntityIdPatiently() {
    return fetchPatiently(async () => {
      const refreshedEntity = await this.model.findById(this.id);
      return refreshedEntity.getDhisTrackedEntityId();
    });
  }

  getDhisTrackedEntityId() {
    return this.metadata?.dhis?.trackedEntityId;
  }

  async setDhisTrackedEntityId(trackedEntityId) {
    this.metadata ??= {};
    this.metadata.dhis ??= {};
    this.metadata.dhis.trackedEntityId = trackedEntityId;
    return this.save();
  }

  hasDhisTrackedEntityId() {
    return !!this.getDhisTrackedEntityId();
  }

  allowsPushingToDhis() {
    const { dhis = {} } = this.metadata || {};
    const { push = true } = dhis; // by default push = true, if an entity shouldn't be pushed to DHIS2, set it to false
    return push;
  }

  /** @returns {Promise<EntityRecord | null>} */
  async countryEntity() {
    return this.model.findOne({ code: this.country_code });
  }

  /** @returns {Promise<EntityPolygon>} */
  async getEntityPolygon() {
    if (!this.entity_polygon_id) return null;
    return await this.otherModels.entityPolygon.findByIdOrThrow(this.entity_polygon_id);
  }

  getBounds() {
    return translateBounds(this.bounds);
  }

  getPoint() {
    return translatePoint(this.point);
  }

  async getPolygon() {
    const entityPolygon = await this.getEntityPolygon();
    return entityPolygon ? translateRegion(entityPolygon.polygon) : null;
  }

  /** @returns {Promise<EntityRecord | undefined>} */
  async getParent(hierarchyId) {
    const ancestors = await this.getAncestors(hierarchyId, { generational_distance: 1 });
    return ancestors && ancestors.length > 0 ? ancestors[0] : undefined;
  }

  /** @returns {Promise<EntityRecord[]>} */
  async getAncestors(hierarchyId, criteria) {
    return this.model.getAncestorsOfEntities(hierarchyId, [this.id], criteria);
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} criteria
   * @param {*} options
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendants(hierarchyId, criteria, options) {
    return this.model.getDescendantsOfEntities(hierarchyId, [this.id], criteria, options);
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} params
   * @returns {Promise<EntityRecord | undefined>}
   */
  async getParentFromParentChildRelation(hierarchyId, params = { filter: {} }) {
    const [parent] = await this.getAncestorsFromParentChildRelation(hierarchyId, {
      ...params,
      filter: { ...params.filter, generational_distance: 1 },
    });
    return parent;
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} params
   * @returns {Promise<EntityRecord[]>}
   */
  async getAncestorsFromParentChildRelation(hierarchyId, params) {
    return await this.model.getAncestorsFromParentChildRelation(hierarchyId, [this.id], params);
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} params
   * @returns {Promise<EntityRecord[]>}
   */
  async getChildrenFromParentChildRelation(hierarchyId, params = { filter: {} }) {
    return await this.getDescendantsFromParentChildRelation(hierarchyId, {
      ...params,
      filter: { ...params.filter, generational_distance: 1 },
    });
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} params
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendantsFromParentChildRelation(hierarchyId, params) {
    return await this.model.getDescendantsFromParentChildRelation(hierarchyId, [this.id], params);
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getRelatives(hierarchyId, criteria) {
    return this.model.getRelativesOfEntities(hierarchyId, [this.id], criteria);
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {EntityTypeEnum} entityType
   * @returns {Promise<EntityRecord | undefined>}
   */
  async getAncestorOfType(hierarchyId, entityType) {
    if (this.type === entityType) return this;
    const [ancestor] = await this.getAncestors(hierarchyId, { type: entityType });
    return ancestor;
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {EntityTypeEnum} entityType
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendantsOfType(hierarchyId, entityType) {
    if (this.type === entityType) return [this];
    return this.getDescendants(hierarchyId, { type: entityType });
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @returns {Promise<EntityRecord[]>}
   */
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
   * @returns {EntityHierarchy['id']}
   */
  async fetchDefaultEntityHierarchyIdPatiently() {
    const hierarchiesIncludingEntity = await fetchPatiently(
      async () =>
        this.otherModels.entityHierarchy.find(
          {
            ancestor_id: this.id,
            [QUERY_CONJUNCTIONS.OR]: {
              descendant_id: this.id,
            },
          },
          {
            joinWith: RECORDS.ANCESTOR_DESCENDANT_RELATION,
            sort: ['entity_hierarchy.name ASC'],
          },
        ),
      v => v.length > 0,
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
   * @param {EntityHierarchy['id']} hierarchyId
   * @returns {EntityRecord}
   */
  async fetchNearestOrgUnitAncestor(hierarchyId) {
    const orgUnitEntityTypes = new Set(Object.values(ORG_UNIT_ENTITY_TYPES));
    // if this is an org unit, don't worry about going deeper
    if (orgUnitEntityTypes.has(this.type)) return this;
    // if no hierarchy id was passed in, default to a hierarchy this entity is a part of
    const entityHierarchyId = hierarchyId || (await this.fetchDefaultEntityHierarchyIdPatiently());
    // get ancestors and return the first that is an org unit type
    // we rely on ancestors being returned in order of proximity to this entity
    const ancestors = await this.getAncestors(entityHierarchyId);
    return ancestors.find(d => orgUnitEntityTypes.has(d.type));
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @returns {Promise<Entity['code'][]>}
   */
  async getAncestorCodes(hierarchyId) {
    const ancestors = await this.getAncestors(hierarchyId);
    return ancestors.map(a => a.code);
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getChildren(hierarchyId, criteria) {
    return this.getDescendants(hierarchyId, { ...criteria, generational_distance: 1 });
  }

  // TUP-3065: getChildrenViaHierarchy (which read from entity_relation) was removed.
  // For project → countries use ProjectRecord.countries(); for sub-country children
  // use getDescendants(...{ generational_distance: 1 }).

  async pointLatLon() {
    const { point } = this;
    if (point) {
      const pointJson = JSON.parse(point);
      return {
        lat: pointJson.coordinates[1],
        lon: pointJson.coordinates[0],
      };
    }
    if (!this.entity_polygon_id) return null;

    // calculate the centroid of the polygon
    const result = await this.database.executeSql(
      'SELECT ST_AsGeoJSON(ST_Centroid(polygon)) AS centroid FROM entity_polygon WHERE id = ?;',
      [this.entity_polygon_id],
    );
    if (!result[0]?.centroid) return null;
    const parsedPoint = JSON.parse(result[0].centroid);
    return {
      lat: parsedPoint.coordinates[1],
      lon: parsedPoint.coordinates[0],
    };
  }
}

export class EntityModel extends MaterializedViewLogDatabaseModel {
  static syncDirection = SyncDirections.BIDIRECTIONAL;

  get excludedFieldsFromSync() {
    return ['point', 'bounds', 'entity_polygon_id', 'parent_id'];
  }

  get DatabaseRecordClass() {
    return EntityRecord;
  }

  /**
   * TUP-3060: canonical lookup for an entity by code within a project's scope.
   *
   * Post-RN-1853 `entity.code` is no longer globally unique — sub-country entities are
   * duplicated per project. Bare `findOne({ code })` returns an arbitrary copy, which
   * silently corrupts behaviour. This helper restricts the lookup to the requested
   * project (plus structural entities with NULL project_id, which are shared).
   *
   * Pass `null` (or omit) for `projectId` if the caller has no project context — in
   * that case the lookup is unscoped and the call is no safer than `findOne({ code })`,
   * but documented as such. Prefer threading project context through callers.
   *
   * @param {string} code
   * @param {string | null} [projectId]
   * @param {*} [otherCriteria]
   * @returns {Promise<EntityRecord | null>}
   */
  async findOneByCodeInProject(code, projectId = null, otherCriteria = {}) {
    if (!projectId) {
      return this.findOne({ code, ...otherCriteria });
    }
    const matches = await this.find({
      code,
      ...otherCriteria,
      [QUERY_CONJUNCTIONS.RAW]: {
        sql: '(project_id IS NULL OR project_id = ?)',
        parameters: [projectId],
      },
    });
    if (matches.length === 0) return null;
    return matches[0];
  }

  get cacheEnabled() {
    return true;
  }

  // ancestor_descendant_relation will be manually flagged as changed once it's been rebuilt
  get cacheDependencies() {
    return [RECORDS.ANCESTOR_DESCENDANT_RELATION];
  }

  customColumnSelectors = {
    point: fieldName => `ST_AsGeoJSON(${fieldName})`,
    bounds: fieldName => `ST_AsGeoJSON(${fieldName})`,
  };

  orgUnitEntityTypes = ORG_UNIT_ENTITY_TYPES;

  types = ENTITY_TYPES;

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

  /**
   * @param {Entity['code']} code
   * @param {Entity['bounds']} bounds
   */
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

  /**
   * @param {Entity['code']} code
   * @param {Entity['attributes']} attributes
   */
  async updateEntityAttributes(code, attributes) {
    attributes = attributes ?? {};
    return this.database.executeSql(
      `
          UPDATE "entity"
          SET "attributes" = ?
          WHERE "code" = ?;
        `,
      [attributes, code],
    );
  }

  /**
   * @param {Entity['code']} code
   * @param {string} geojson
   * @param {string} dataSource Source identifier for the polygon (e.g. 'openstreetmap',
   *   'admin_import'). Required because (code, data_source) is the natural key on
   *   entity_polygon — distinct sources can share a code but the same source can't
   *   reuse one.
   */
  async updatePolygonCoordinates(code, geojson, dataSource) {
    if (!dataSource) {
      throw new Error('updatePolygonCoordinates requires a dataSource');
    }
    return this.database.wrapInTransaction(async transactingDatabase => {
      // FOR UPDATE serializes concurrent callers so we don't create orphan
      // entity_polygon rows when two updates race for the same entity.
      const [entity] = await transactingDatabase.executeSql(
        'SELECT id, entity_polygon_id, name FROM entity WHERE code = ? FOR UPDATE;',
        [code],
      );
      if (!entity) {
        throw new Error(`No entity found with code: ${code}`);
      }

      if (entity.entity_polygon_id) {
        await transactingDatabase.executeSql(
          'UPDATE entity_polygon SET polygon = ST_GeomFromGeoJSON(?) WHERE id = ?;',
          [geojson, entity.entity_polygon_id],
        );
      } else {
        const [{ id: polygonId }] = await transactingDatabase.executeSql(
          `
            INSERT INTO entity_polygon (polygon, name, code, data_source)
            VALUES (ST_GeomFromGeoJSON(?), ?, ?, ?)
            RETURNING id;
          `,
          [geojson, entity.name, code, dataSource],
        );
        await transactingDatabase.executeSql(
          'UPDATE entity SET entity_polygon_id = ? WHERE id = ?;',
          [polygonId, entity.id],
        );
      }

      // Match the original updateRegionCoordinates semantics: only set bounds
      // when it is currently null.
      await transactingDatabase.executeSql(
        `
          UPDATE entity
          SET bounds = ST_Envelope(ST_GeomFromGeoJSON(?)::geometry)
          WHERE id = ? AND bounds IS NULL;
        `,
        [geojson, entity.id],
      );
    });
  }

  /**
   * Fetches descendant => ancestor map in given hierarchy
   * @param {string[]} descendantCodes
   * @param {string} hierarchyId
   * @param {string} ancestorType
   * @returns {Promise<Record<string, { code: string, name: string }>>} Map of descendant code to ancestor (code, name)
   */
  async fetchAncestorDetailsByDescendantCode(descendantCodes, hierarchyId, ancestorType) {
    const cacheKey = this.getCacheKey(this.fetchAncestorDetailsByDescendantCode.name, arguments);
    return this.runCachedFunction(cacheKey, async () => {
      // TUP-3065: previously read from the ancestor_descendant_relation closure cache;
      // that table is retired. Walk for each descendant via the unified parent_id +
      // project_country edges CTE (in getRelationsOfEntities) and pick the closest
      // ancestor of the requested type.
      //
      // Project scope: scope the descendant lookup to (NULL or project) so that
      // cross-project codes don't bleed in. Each descendant's ancestor walk inherits
      // the same scope via getAncestorsOfEntities.
      const project = hierarchyId
        ? await this.otherModels.project.findOne({ entity_hierarchy_id: hierarchyId })
        : null;
      const projectId = project?.id ?? null;

      const descendantEntities = await this.find({
        code: descendantCodes,
        ...(projectId
          ? {
              [QUERY_CONJUNCTIONS.RAW]: {
                sql: '(project_id IS NULL OR project_id = ?)',
                parameters: [projectId],
              },
            }
          : {}),
      });

      const ancestorDetailsByDescendantCode = {};
      // Walk each descendant's ancestors in parallel; each call hits one recursive CTE.
      await Promise.all(
        descendantEntities.map(async descendant => {
          const ancestors = await this.getAncestorsOfEntities(hierarchyId, [descendant.id], {
            type: ancestorType,
          });
          // ancestors come back ordered by generational_distance ASC, so [0] is closest.
          if (ancestors.length > 0) {
            ancestorDetailsByDescendantCode[descendant.code] = {
              code: ancestors[0].code,
              name: ancestors[0].name,
            };
          }
        }),
      );
      return ancestorDetailsByDescendantCode;
    });
  }

  /**
   * Returns relations (either ancestors or descendants) of entity, traversing
   * entity.parent_id directly. TUP-3065: previously read from the
   * ancestor_descendant_relation closure cache; that table has been retired along
   * with the EntityHierarchyCacher subsystem (see also TUP-3068).
   *
   * @param {(typeof ENTITY_RELATION_TYPE)[keyof typeof ENTITY_RELATION_TYPE]} ancestorsOrDescendants
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @param {*} options
   * @returns {Promise<EntityRecord[]>}
   */
  async getRelationsOfEntities(ancestorsOrDescendants, entityIds, criteria, options) {
    if (!entityIds || entityIds.length === 0) return [];

    const cacheKey = this.getCacheKey(this.getRelationsOfEntities.name, arguments);
    const isDescendants = ancestorsOrDescendants === ENTITY_RELATION_TYPE.DESCENDANTS;

    // Pull out the bits of `criteria` that drove the closure cache; the rest is
    // entity-column filters that get applied to the outer `find` (e.g. `type`).
    const {
      entity_hierarchy_id: hierarchyId,
      generational_distance: generationalDistance,
      ...entityCriteria
    } = criteria || {};

    // Resolve the project from the legacy hierarchyId so the walk stays project-
    // scoped — both for the entity.parent_id chain and for the project_country bridge
    // (the latter is the only path between a project entity and its countries
    // post-RN-1853, since country.parent_id points at world rather than at any
    // particular project).
    const project = hierarchyId
      ? await this.otherModels.project.findOne({ entity_hierarchy_id: hierarchyId })
      : null;
    const projectId = project?.id ?? null;
    const entityScopeClause = projectId ? '(e.project_id IS NULL OR e.project_id = ?)' : 'TRUE';
    const entityScopeParam = projectId ? [projectId] : [];
    // project_country edges are tied to a specific project; if we don't have one we
    // include them all (rare — only happens if hierarchyId wasn't supplied).
    const projectCountryScopeClause = projectId ? 'pc.project_id = ?' : 'TRUE';
    const projectCountryScopeParam = projectId ? [projectId] : [];

    // Unified edges subquery: `parent_id` chain + project_country bridge. Each row is
    // (source, target) where source → target is a parent → child link. project_country
    // is treated as a project-entity → country edge so a descendant walk from a
    // project hits its countries even though country.parent_id doesn't point back.
    //
    // Inlined twice (base case + recursive case) because Knex's withRecursive helper
    // only accepts a single CTE body — Postgres allows multiple CTEs but we don't have
    // ergonomic plumbing for that here.
    const edgesSubquery = `
      SELECT e.parent_id AS source, e.id AS target
      FROM entity e
      WHERE e.parent_id IS NOT NULL
        AND ${entityScopeClause}
      UNION ALL
      SELECT p.entity_id AS source, pc.country_id AS target
      FROM project_country pc
      INNER JOIN project p ON p.id = pc.project_id
      WHERE ${projectCountryScopeClause}
    `;

    const recursiveQuery = isDescendants
      ? `
          SELECT target AS id, 1 AS generational_distance
          FROM (${edgesSubquery}) base_edges
          WHERE source IN ${SqlQuery.record(entityIds)}

          UNION ALL

          SELECT step_edges.target AS id, h.generational_distance + 1 AS generational_distance
          FROM (${edgesSubquery}) step_edges
          INNER JOIN hierarchy h ON step_edges.source = h.id
          ${generationalDistance !== undefined ? 'WHERE h.generational_distance <= ?' : ''}
        `
      : `
          SELECT source AS id, 1 AS generational_distance
          FROM (${edgesSubquery}) base_edges
          WHERE target IN ${SqlQuery.record(entityIds)}

          UNION ALL

          SELECT step_edges.source AS id, h.generational_distance + 1 AS generational_distance
          FROM (${edgesSubquery}) step_edges
          INNER JOIN hierarchy h ON step_edges.target = h.id
          ${generationalDistance !== undefined ? 'WHERE h.generational_distance <= ?' : ''}
        `;

    const parameters = [
      // Base case: edges subquery scope + entityIds
      ...entityScopeParam,
      ...projectCountryScopeParam,
      ...entityIds,
      // Recursive case: edges subquery scope + (optional) generational_distance bound
      ...entityScopeParam,
      ...projectCountryScopeParam,
      ...(generationalDistance !== undefined ? [generationalDistance] : []),
    ];

    const entityRecords = await this.runCachedFunction(cacheKey, async () => {
      const relations = await this.find(
        {
          ...entityCriteria,
          'hierarchy.generational_distance': generationalDistance,
        },
        {
          withRecursive: { alias: 'hierarchy', query: recursiveQuery, parameters },
          joinWith: 'hierarchy',
          joinCondition: ['entity.id', 'hierarchy.id'],
          sort: ['hierarchy.generational_distance ASC'],
          ...options,
        },
      );
      const relationData = await Promise.all(relations.map(async r => r.getData()));
      return uniqBy(relationData, r => r.id);
    });

    return await Promise.all(entityRecords.map(async r => this.generateInstance(r)));
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getAncestorsOfEntities(hierarchyId, entityIds, criteria) {
    return this.getRelationsOfEntities(ENTITY_RELATION_TYPE.ANCESTORS, entityIds, {
      entity_hierarchy_id: hierarchyId,
      ...criteria,
    });
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @param {*} options
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendantsOfEntities(hierarchyId, entityIds, criteria, options) {
    return this.getRelationsOfEntities(
      ENTITY_RELATION_TYPE.DESCENDANTS,
      entityIds,
      {
        entity_hierarchy_id: hierarchyId,
        ...criteria,
      },
      options,
    );
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} entityIds
   * @param {(typeof ENTITY_RELATION_TYPE)[keyof typeof ENTITY_RELATION_TYPE]} direction
   * @param {*} params
   */
  async getEntitiesFromParentChildRelation(hierarchyId, entityIds, direction, params = {}) {
    if (!entityIds || entityIds.length === 0) {
      return [];
    }

    const methodName =
      direction === ENTITY_RELATION_TYPE.DESCENDANTS
        ? this.getDescendantsFromParentChildRelation.name
        : this.getAncestorsFromParentChildRelation.name;

    const cacheKey = this.getCacheKey(methodName, [hierarchyId, entityIds, direction, params]);

    return await this.runCachedFunction(cacheKey, async () => {
      const { filter = {}, fields, pageSize } = params;
      const { generational_distance, ...restOfFilter } = filter;

      const isDescendants = direction === ENTITY_RELATION_TYPE.DESCENDANTS;

      // Post-RN-1853 (TUP-3065): walk entity.parent_id directly. The
      // entity_parent_child_relation cache is now 1:1 with the parent_id chain — the
      // chain is project-scoped because each project has its own copy of sub-country
      // entities, and the duplicates carry the parent_id of their same-project parent
      // (set up by the migration's fixParentIdChains step).
      //
      // Ancestor walks are naturally project-scoped: each entity has exactly one
      // parent_id, so walking up never crosses into a sibling project. Descendant
      // walks need an explicit project_id filter when starting from a structural
      // entity (world/project/country with NULL project_id) — otherwise we'd visit
      // every project's sub-country children. Resolve the project from the legacy
      // hierarchyId argument so callers don't need to change.
      const project = hierarchyId
        ? await this.otherModels.project.findOne({ entity_hierarchy_id: hierarchyId })
        : null;
      const projectId = project?.id ?? null;

      const projectScopeClause = projectId
        ? '(project_id IS NULL OR project_id = ?)'
        : 'TRUE';
      const projectScopeParam = projectId ? [projectId] : [];

      const recursiveQuery = isDescendants
        ? `
          -- Base case: direct children of entityIds
          SELECT id, parent_id, 1 AS generational_distance
          FROM entity
          WHERE parent_id IN ${SqlQuery.record(entityIds)}
            AND ${projectScopeClause}

          UNION ALL

          -- Recursive case: walk down the parent_id chain
          SELECT e.id, e.parent_id, h.generational_distance + 1 AS generational_distance
          FROM entity e
          INNER JOIN hierarchy h ON e.parent_id = h.id
          WHERE ${projectScopeClause}
            ${generational_distance !== undefined ? 'AND h.generational_distance <= ?' : ''}
        `
        : `
          -- Base case: direct parents of entityIds
          SELECT id, parent_id, 1 AS generational_distance
          FROM entity
          WHERE id IN (
            SELECT parent_id FROM entity WHERE id IN ${SqlQuery.record(entityIds)}
          )

          UNION ALL

          -- Recursive case: walk up the parent_id chain
          SELECT e.id, e.parent_id, h.generational_distance + 1 AS generational_distance
          FROM entity e
          INNER JOIN hierarchy h ON e.id = h.parent_id
          ${generational_distance !== undefined ? 'WHERE h.generational_distance <= ?' : ''}
        `;

      const parameters = isDescendants
        ? [
            ...entityIds,
            ...projectScopeParam, // base case scope
            ...projectScopeParam, // recursive case scope
            ...(generational_distance !== undefined ? [generational_distance] : []),
          ]
        : [
            ...entityIds,
            ...(generational_distance !== undefined ? [generational_distance] : []),
          ];

      const results = await this.find(
        {
          'hierarchy.generational_distance': generational_distance,
          ...restOfFilter,
        },
        {
          withRecursive: {
            alias: 'hierarchy',
            query: recursiveQuery,
            parameters,
          },
          joinWith: 'hierarchy',
          joinCondition: ['entity.id', 'hierarchy.id'],
          columns: fields,
          limit: pageSize,
        },
      );

      return results;
    });
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} parentIds
   * @param {*} params
   */
  async getDescendantsFromParentChildRelation(hierarchyId, parentIds, params = {}) {
    return await this.getEntitiesFromParentChildRelation(
      hierarchyId,
      parentIds,
      ENTITY_RELATION_TYPE.DESCENDANTS,
      params,
    );
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} childIds
   * @param {*} params
   */
  async getAncestorsFromParentChildRelation(hierarchyId, childIds, params = {}) {
    return await this.getEntitiesFromParentChildRelation(
      hierarchyId,
      childIds,
      ENTITY_RELATION_TYPE.ANCESTORS,
      params,
    );
  }

  /**
   * @param {Project['id']} projectId
   * @param {Entity['id']} entityId
   * @returns {Promise<Entity['name'] | undefined>}
   */
  async getParentEntityName(projectId, entityId) {
    const [entity, project] = await Promise.all([
      this.findById(entityId),
      this.otherModels.project.findById(projectId),
    ]);
    assertIsNotNullish(entity, `No entity exists with ID ${entityId}`);
    assertIsNotNullish(project, `No project exists with ID ${projectId}`);

    const entityIsNotCountry =
      project.entity_hierarchy_id && entity.type !== EntityTypeEnum.country;
    const parentEntity = entityIsNotCountry
      ? await entity.getParentFromParentChildRelation(project.entity_hierarchy_id)
      : null;
    return parentEntity?.name;
  }

  /**
   * @param {EntityHierarchy['id']} hierarchyId
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getRelativesOfEntities(hierarchyId, entityIds, criteria) {
    // getAncestors() comes sorted closest -> furthest, we want furthest -> closest
    const ancestors = (
      await this.getAncestorsOfEntities(hierarchyId, entityIds, criteria)
    ).toReversed();

    const self = await this.find({
      ...criteria,
      id: entityIds, // Find an entity that matches the criteria AND themselves
    });

    const descendants = await this.getDescendantsOfEntities(hierarchyId, entityIds, criteria);

    return [...ancestors, ...self, ...descendants];
  }

  getDhisLevel(type) {
    const level = ORG_UNIT_TYPE_LEVELS[type];
    if (!level) {
      throw new Error(`${type} is not an organisational unit type`);
    }

    return level;
  }

  /**
   * @returns {Promise<EntityTypeEnum[]>}
   */
  async getEntityTypes() {
    const entityTypes = await this.database.executeSql(
      'SELECT unnest(enum_range(NULL::entity_type)::TEXT[]) AS type ORDER BY type;',
    );
    return entityTypes.map(({ type }) => type);
  }

  /**
   * @param {Entity['id']} id
   */
  async getCodeFromId(id) {
    return await this.findById(id, { fields: ['code'] });
  }

  async buildSyncLookupQueryDetails() {
    return {
      // TODO: Remove survey response entities and task entities
      // when MAUI-5722 is complete
      ctes: [
        `
          entities_to_sync AS (
            -- root project entities
            SELECT entity.id AS entity_id, project.entity_hierarchy_id
            FROM entity JOIN project on entity.id = project.entity_id
            UNION

            -- all child entities at all levels
            SELECT child_id AS entity_id, entity_hierarchy_id
            FROM entity_parent_child_relation
            UNION

            -- survey response entities
            SELECT survey_response.entity_id, project.entity_hierarchy_id
            FROM survey_response
            JOIN survey ON survey.id = survey_response.survey_id
            JOIN project ON project.id = survey.project_id
            UNION

            -- task entities
            SELECT task.entity_id, project.entity_hierarchy_id
            FROM task
            JOIN survey ON survey.id = task.survey_id
            JOIN project ON project.id = survey.project_id
          )
        `,
      ],
      select: await buildSyncLookupSelect(this, {
        // Sync all world, country and project entities as they are needed for entity hierarchy
        projectIds: `
          CASE WHEN entity.type IN ('country', 'world', 'project')
            THEN NULL
          ELSE
            array_remove(array_agg(DISTINCT project.id), NULL)
          END`,
      }),
      joins: `
        LEFT JOIN entities_to_sync
          ON entities_to_sync.entity_id = entity.id
        LEFT JOIN project
          ON project.entity_hierarchy_id = entities_to_sync.entity_hierarchy_id
      `,
      where: `
        entity.updated_at_sync_tick > :since
        -- When an entity_parent_child_relation is updated, we need to rebuild the child and parent entities
        -- in case they haven't got the project_ids updated to the right ones yet
        OR entity.id IN (
          SELECT child_id FROM entity_parent_child_relation WHERE updated_at_sync_tick > :since
          UNION
          SELECT parent_id FROM entity_parent_child_relation WHERE updated_at_sync_tick > :since
        )
      `,
      groupBy: ['entity.id'],
    };
  }

  sanitizeForCentralServer = data => {
    const { parent_id, ...rest } = data;
    // Only include parent_id when syncing entities up to central if parent_id exists
    return parent_id ? data : rest;
  };
}
