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
import {
  PROJECT_HIERARCHY_EDGES_SUBQUERY,
  projectHierarchyEdgesParams,
} from './projectHierarchyEdges';

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
  async getParent(projectId) {
    const ancestors = await this.getAncestors(projectId, { generational_distance: 1 });
    return ancestors && ancestors.length > 0 ? ancestors[0] : undefined;
  }

  /** @returns {Promise<EntityRecord[]>} */
  async getAncestors(projectId, criteria) {
    return this.model.getAncestorsOfEntities(projectId, [this.id], criteria);
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} criteria
   * @param {*} options
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendants(projectId, criteria, options) {
    return this.model.getDescendantsOfEntities(projectId, [this.id], criteria, options);
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} params
   * @returns {Promise<EntityRecord | undefined>}
   */
  async getParentFromParentChildRelation(projectId, params = { filter: {} }) {
    const [parent] = await this.getAncestorsFromParentChildRelation(projectId, {
      ...params,
      filter: { ...params.filter, generational_distance: 1 },
    });
    return parent;
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} params
   * @returns {Promise<EntityRecord[]>}
   */
  async getAncestorsFromParentChildRelation(projectId, params) {
    return await this.model.getAncestorsFromParentChildRelation(projectId, [this.id], params);
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} params
   * @returns {Promise<EntityRecord[]>}
   */
  async getChildrenFromParentChildRelation(projectId, params = { filter: {} }) {
    return await this.getDescendantsFromParentChildRelation(projectId, {
      ...params,
      filter: { ...params.filter, generational_distance: 1 },
    });
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} params
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendantsFromParentChildRelation(projectId, params) {
    return await this.model.getDescendantsFromParentChildRelation(projectId, [this.id], params);
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getRelatives(projectId, criteria) {
    return this.model.getRelativesOfEntities(projectId, [this.id], criteria);
  }

  /**
   * @param {Project['id']} projectId
   * @param {EntityTypeEnum} entityType
   * @returns {Promise<EntityRecord | undefined>}
   */
  async getAncestorOfType(projectId, entityType) {
    if (this.type === entityType) return this;
    const [ancestor] = await this.getAncestors(projectId, { type: entityType });
    return ancestor;
  }

  /**
   * @param {Project['id']} projectId
   * @param {EntityTypeEnum} entityType
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendantsOfType(projectId, entityType) {
    if (this.type === entityType) return [this];
    return this.getDescendants(projectId, { type: entityType });
  }

  /**
   * @param {Project['id']} projectId
   * @returns {Promise<EntityRecord[]>}
   */
  async getNearestOrgUnitDescendants(projectId) {
    const orgUnitEntityTypes = new Set(Object.values(ORG_UNIT_ENTITY_TYPES));
    // if this is an org unit, don't worry about going deeper
    if (orgUnitEntityTypes.has(this.type)) return [this];
    // get descendants and return all of the first type that is an org unit type
    // we rely on descendants being returned in order, with those higher in the hierarchy first
    const descendants = await this.getDescendants(projectId);
    const nearestOrgUnitDescendant = descendants.find(d => orgUnitEntityTypes.has(d.type));
    if (!nearestOrgUnitDescendant) {
      return [];
    }
    return descendants.filter(d => d.type === nearestOrgUnitDescendant.type);
  }

  /**
   * Returns the id of the project to use by default for this entity, if none is specified.
   * Prefers the "explore" project; otherwise the first project containing this entity,
   * alphabetically by project name.
   * @returns {Promise<Project['id']>}
   */
  async fetchDefaultProjectIdPatiently() {
    const projectsIncludingEntity = await fetchPatiently(
      async () => {
        // Dedupe project_ids in SQL — a high-up entity (country, world) can be
        // ancestor of thousands of rows that collapse to a handful of projects.
        const rows = await this.database.executeSql(
          `SELECT DISTINCT project_id FROM ancestor_descendant_relation
           WHERE ancestor_id = ? OR descendant_id = ?;`,
          [this.id, this.id],
        );
        if (rows.length === 0) return [];
        return this.otherModels.project.find(
          { id: rows.map(r => r.project_id) },
          { sort: ['code ASC'] },
        );
      },
      v => v.length > 0,
    );
    if (projectsIncludingEntity.length === 0) {
      throw new Error(`The entity with id ${this.id} is not included in any project hierarchy`);
    }
    const exploreProject = projectsIncludingEntity.find(p => p.code === 'explore');
    return exploreProject ? exploreProject.id : projectsIncludingEntity[0].id;
  }

  /**
   * Fetches the closest node in the entity hierarchy that is an organisation unit,
   * starting from the entity itself and traversing the hierarchy up
   * @param {Project['id']} [projectId]
   * @returns {EntityRecord}
   */
  async fetchNearestOrgUnitAncestor(projectId) {
    const orgUnitEntityTypes = new Set(Object.values(ORG_UNIT_ENTITY_TYPES));
    // if this is an org unit, don't worry about going deeper
    if (orgUnitEntityTypes.has(this.type)) return this;
    // if no project id was passed in, default to a project this entity is a part of
    const resolvedProjectId = projectId || (await this.fetchDefaultProjectIdPatiently());
    // get ancestors and return the first that is an org unit type
    // we rely on ancestors being returned in order of proximity to this entity
    const ancestors = await this.getAncestors(resolvedProjectId);
    return ancestors.find(d => orgUnitEntityTypes.has(d.type));
  }

  /**
   * @param {Project['id']} projectId
   * @returns {Promise<Entity['code'][]>}
   */
  async getAncestorCodes(projectId) {
    const ancestors = await this.getAncestors(projectId);
    return ancestors.map(a => a.code);
  }

  /**
   * @param {Project['id']} projectId
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getChildren(projectId, criteria) {
    return this.getDescendants(projectId, { ...criteria, generational_distance: 1 });
  }

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

    // Calculate the centroid of the polygon.
    const result = await this.database.executeSql(
      'SELECT ST_AsGeoJSON(ST_Centroid(ST_AsGeoJSON(polygon))) AS centroid FROM entity_polygon WHERE id = ?;',
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
   * @param {string} code
   * @param {string | null} [projectId]
   * @param {*} [otherCriteria]
   * @param {*} [options]
   * @returns {Promise<EntityRecord | null>}
   */
  async findOneByCodeInProject(code, projectId = null, otherCriteria = {}, options = {}) {
    if (!projectId) {
      return this.findOne({ code, ...otherCriteria }, options);
    }
    // Sort `NULLS LAST` so a project-specific match (project_id = projectId) always
    // wins over the structural fallback (project_id IS NULL). Without this, when the
    // same code exists as both a shared structural row and a per-project copy, Postgres
    // returns them in planner-dependent order and the result is non-deterministic.
    return this.findOne(
      {
        code,
        ...otherCriteria,
        [QUERY_CONJUNCTIONS.RAW]: {
          sql: '(project_id IS NULL OR project_id = ?)',
          parameters: [projectId],
        },
      },
      { ...options, sort: ['project_id ASC NULLS LAST'] },
    );
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
   * Fetches descendant => ancestor map in given project's hierarchy
   * @param {string[]} descendantCodes
   * @param {Project['id']} projectId
   * @param {string} ancestorType
   * @returns {Promise<Record<string, { code: string, name: string }>>} Map of descendant code to ancestor (code, name)
   */
  async fetchAncestorDetailsByDescendantCode(descendantCodes, projectId, ancestorType) {
    const cacheKey = this.getCacheKey(this.fetchAncestorDetailsByDescendantCode.name, arguments);
    // in testing this function, there was no issue with many bound parameters, and reducing the
    // number of batches greatly improved performance - so here we use a higher max bindings number
    const maxBoundParameters = 20000;
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
              ancestor_descendant_relation.project_id = ?
            AND
              ancestor.type = ?
            ORDER BY
              generational_distance ASC
          `,
          [...batchOfDescendantCodes, projectId, ancestorType],
        ],
        maxBoundParameters,
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

  /**
   * @param {(typeof ENTITY_RELATION_TYPE)[keyof typeof ENTITY_RELATION_TYPE]} ancestorsOrDescendants
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @param {*} options
   * @returns {Promise<EntityRecord[]>}
   */
  async getRelationsOfEntities(ancestorsOrDescendants, entityIds, criteria, options) {
    const cacheKey = this.getCacheKey(this.getRelationsOfEntities.name, arguments);
    const [joinTablesOn, filterByEntityId] =
      ancestorsOrDescendants === ENTITY_RELATION_TYPE.ANCESTORS
        ? ['ancestor_id', 'descendant_id']
        : ['descendant_id', 'ancestor_id'];

    const entityRecords = await this.runCachedFunction(cacheKey, async () => {
      const relations = await this.find(
        {
          ...criteria,
          [filterByEntityId]: entityIds,
        },
        {
          joinWith: RECORDS.ANCESTOR_DESCENDANT_RELATION,
          joinCondition: ['entity.id', joinTablesOn],
          sort: ['generational_distance ASC'],
          ...options,
        },
      );
      const relationData = await Promise.all(relations.map(async r => r.getData()));
      return uniqBy(relationData, r => r.id);
    });

    return await Promise.all(entityRecords.map(async r => this.generateInstance(r)));
  }

  /**
   * @param {Project['id']} projectId
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getAncestorsOfEntities(projectId, entityIds, criteria) {
    return this.getRelationsOfEntities(ENTITY_RELATION_TYPE.ANCESTORS, entityIds, {
      'ancestor_descendant_relation.project_id': projectId,
      ...criteria,
    });
  }

  /**
   * @param {Project['id']} projectId
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @param {*} options
   * @returns {Promise<EntityRecord[]>}
   */
  async getDescendantsOfEntities(projectId, entityIds, criteria, options) {
    return this.getRelationsOfEntities(
      ENTITY_RELATION_TYPE.DESCENDANTS,
      entityIds,
      {
        'ancestor_descendant_relation.project_id': projectId,
        ...criteria,
      },
      options,
    );
  }

  /**
   * @param {Project['id']} projectId
   * @param {Entity['id'][]} entityIds
   * @param {(typeof ENTITY_RELATION_TYPE)[keyof typeof ENTITY_RELATION_TYPE]} direction
   * @param {*} params
   */
  async getEntitiesFromParentChildRelation(projectId, entityIds, direction, params = {}) {
    if (!entityIds || entityIds.length === 0) {
      return [];
    }

    const methodName =
      direction === ENTITY_RELATION_TYPE.DESCENDANTS
        ? this.getDescendantsFromParentChildRelation.name
        : this.getAncestorsFromParentChildRelation.name;

    const cacheKey = this.getCacheKey(methodName, [projectId, entityIds, direction, params]);

    return await this.runCachedFunction(cacheKey, async () => {
      const { filter = {}, fields, pageSize } = params;
      const { generational_distance, ...restOfFilter } = filter;

      const isDescendants = direction === ENTITY_RELATION_TYPE.DESCENDANTS;

      const edgesSubquery = PROJECT_HIERARCHY_EDGES_SUBQUERY;
      const edgesParams = projectHierarchyEdgesParams(projectId);

      const DEPTH_CAP = 50;
      const generationalDistanceClause =
        generational_distance !== undefined
          ? `AND h.generational_distance < ? AND h.generational_distance < ${DEPTH_CAP}`
          : `AND h.generational_distance < ${DEPTH_CAP}`;

      const recursiveQuery = isDescendants
        ? `
          -- Base case: direct descendants of entityIds via either edge source.
          SELECT descendant_id AS id, ancestor_id AS parent_id, 1 AS generational_distance
          FROM (${edgesSubquery}) base_edges
          WHERE ancestor_id IN ${SqlQuery.record(entityIds)}

          UNION ALL

          -- Recursive case: extend by one descendant edge.
          SELECT step_edges.descendant_id AS id, step_edges.ancestor_id AS parent_id,
                 h.generational_distance + 1 AS generational_distance
          FROM (${edgesSubquery}) step_edges
          INNER JOIN hierarchy h ON step_edges.ancestor_id = h.id
          WHERE 1 = 1 ${generationalDistanceClause}
        `
        : `
          -- Base case: direct ancestors of entityIds via either edge source.
          SELECT ancestor_id AS id, ancestor_id AS parent_id, 1 AS generational_distance
          FROM (${edgesSubquery}) base_edges
          WHERE descendant_id IN ${SqlQuery.record(entityIds)}

          UNION ALL

          -- Recursive case: extend by one ancestor edge.
          SELECT step_edges.ancestor_id AS id, step_edges.ancestor_id AS parent_id,
                 h.generational_distance + 1 AS generational_distance
          FROM (${edgesSubquery}) step_edges
          INNER JOIN hierarchy h ON step_edges.descendant_id = h.id
          WHERE 1 = 1 ${generationalDistanceClause}
        `;

      const recursiveStepParams = [
        ...edgesParams,
        ...(generational_distance !== undefined ? [generational_distance] : []),
      ];
      const parameters = [
        ...edgesParams, // base case edges scope
        ...entityIds, // base case entity ids
        ...recursiveStepParams, // recursive case edges scope + (optional) gd
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
   * @param {Project['id']} projectId
   * @param {Entity['id'][]} parentIds
   * @param {*} params
   */
  async getDescendantsFromParentChildRelation(projectId, parentIds, params = {}) {
    return await this.getEntitiesFromParentChildRelation(
      projectId,
      parentIds,
      ENTITY_RELATION_TYPE.DESCENDANTS,
      params,
    );
  }

  /**
   * @param {Project['id']} projectId
   * @param {Entity['id'][]} childIds
   * @param {*} params
   */
  async getAncestorsFromParentChildRelation(projectId, childIds, params = {}) {
    return await this.getEntitiesFromParentChildRelation(
      projectId,
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

    if (entity.type === EntityTypeEnum.country) return undefined;
    const parentEntity = await entity.getParentFromParentChildRelation(project.id);
    return parentEntity?.name;
  }

  /**
   * @param {Project['id']} projectId
   * @param {Entity['id'][]} entityIds
   * @param {*} criteria
   * @returns {Promise<EntityRecord[]>}
   */
  async getRelativesOfEntities(projectId, entityIds, criteria) {
    // getAncestors() comes sorted closest -> furthest, we want furthest -> closest
    const ancestors = (
      await this.getAncestorsOfEntities(projectId, entityIds, criteria)
    ).toReversed();

    const self = await this.find({
      ...criteria,
      id: entityIds, // Find an entity that matches the criteria AND themselves
    });

    const descendants = await this.getDescendantsOfEntities(projectId, entityIds, criteria);

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
    //Sub-country entities carry a direct project_id; structural entities
    // (world/country/project) are synced unconditionally because every project
    // needs them for hierarchy walks. Country-level rows reach their owning projects
    // via project_country.
    //
    // TODO (MAUI-5722): Remove survey response / task entity unions once mobile no
    // longer pulls those entities through entity sync.
    return {
      ctes: [
        `
          entities_to_sync AS (
            -- root project entities → owning project
            SELECT entity.id AS entity_id, project.id AS project_id
            FROM entity JOIN project ON entity.id = project.entity_id
            UNION

            -- country entities → projects that include them via project_country
            SELECT pc.country_id AS entity_id, pc.project_id
            FROM project_country pc
            UNION

            -- sub-country entities carry their owning project directly
            SELECT entity.id AS entity_id, entity.project_id
            FROM entity
            WHERE entity.project_id IS NOT NULL
            UNION

            -- survey response entities
            SELECT survey_response.entity_id, survey.project_id
            FROM survey_response
            JOIN survey ON survey.id = survey_response.survey_id
            UNION

            -- task entities
            SELECT task.entity_id, survey.project_id
            FROM task
            JOIN survey ON survey.id = task.survey_id
          )
        `,
      ],
      select: await buildSyncLookupSelect(this, {
        // Sync all world, country and project entities as they are needed for entity hierarchy
        projectIds: `
          CASE WHEN entity.type IN ('country', 'world', 'project')
            THEN NULL
          ELSE
            array_remove(array_agg(DISTINCT entities_to_sync.project_id), NULL)
          END`,
      }),
      joins: `
        LEFT JOIN entities_to_sync
          ON entities_to_sync.entity_id = entity.id
      `,
      where: `entity.updated_at_sync_tick > :since`,
      groupBy: ['entity.id'],
    };
  }

  sanitizeForCentralServer = data => {
    const { parent_id, ...rest } = data;
    // Only include parent_id when syncing entities up to central if parent_id exists
    return parent_id ? data : rest;
  };
}
