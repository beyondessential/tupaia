'use strict';

import { insertObject, arrayToDbString, generateId } from '../utilities';
import { FIJI_ENTITIES_PROVINCES } from './migrationData/20200603121401-createWishCatchmentHierarchy/WishProvinces';
import { FIJI_ENTITIES_SUB_CATCHMENTS } from './migrationData/20200603121401-createWishCatchmentHierarchy/WishCatchments';
import {
  FIJI_ENTITIES_NEW_VILLAGES,
  FIJI_ENTITIES_VILLAGES_HEIRARCHIES,
} from './migrationData/20200603121401-createWishCatchmentHierarchy/WishVillages';
import FIJI_ENTITIES_PROVINCES_GEODATA from './migrationData/20200603121401-createWishCatchmentHierarchy/fiji_admin2_province_4326_flat.json';
import FIJI_ENTITIES_SUBCATCHMENTS_GEODATA from './migrationData/20200603121401-createWishCatchmentHierarchy/fiji_sub-catchments_4326_flat.json';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const COUNTRY_CODE = 'FJ';
const PROJECT_CODE = 'wish';

const convertFeaturesToMap = features => {
  return features.reduce(function (map, feature) {
    map[feature.code] = feature.region;
    return map;
  }, {});
};

const addGeoDataToEntities = (entities, geoDatatMap) => {
  return entities.map(entity => ({ ...entity, region: geoDatatMap[entity.code] }));
};

const getIdFromCode = async (db, code) => {
  const record = await db.runSql(`SELECT id FROM entity WHERE code = '${code}'`);
  return record.rows[0] && record.rows[0].id;
};

const getHeirarchyId = async db => {
  const record = await db.runSql(
    `select id from entity_hierarchy where name = '${PROJECT_CODE}' limit 1;`,
  );
  return record.rows[0] && record.rows[0].id;
};

const getSetClausesForGeoFields = (fieldName, fieldValue) => [
  `"${fieldName}" = ST_Force2D(ST_GeomFromGeoJSON('${JSON.stringify(fieldValue)}'))`,
  `bounds = ST_Expand(ST_Envelope(ST_GeomFromGeoJSON('${JSON.stringify(
    fieldValue,
  )}')::geometry), 1)`,
];

const deleteEntities = async (db, entities) => {
  await deleteEntitiesWithCodes(
    db,
    entities.map(entity => entity.code),
  );
};

const deleteEntitiesWithCodes = async (db, codes) => {
  await db.runSql(`DELETE FROM entity WHERE code IN (${arrayToDbString(codes)})`);
};

// This is a bit hacky but delete all relations that aren't the existing top relation
const deleteEntityRelations = async db => {
  const countryId = await getIdFromCode(db, COUNTRY_CODE);
  const heirarchyId = await getHeirarchyId(db);
  db.runSql(
    `DELETE FROM entity_relation WHERE entity_hierarchy_id = '${heirarchyId}' and child_id != '${countryId}'`,
  );
};

const insertEntities = async (db, entities, hierarchyId, ParentIdMap = {}) => {
  const idMap = {};

  await Promise.all(
    entities.map(async entity => {
      const id = await insertEntity(db, entity, hierarchyId, ParentIdMap);
      idMap[entity.code] = id;
    }),
  );
  return idMap;
};

const insertEntity = async (db, entity, hierarchyId, parentIdMap) => {
  const { code, name, type: entityType, parent_code: parentCode, point, region } = entity;
  const parentId = parentIdMap.hasOwnProperty(parentCode)
    ? parentIdMap[parentCode]
    : await getIdFromCode(db, parentCode);

  const record = await insertObject(db, 'entity', {
    id: generateId(),
    code,
    parent_id: parentId,
    name,
    type: entityType,
    country_code: COUNTRY_CODE,
    metadata: { dhis: { isDataRegional: true } },
  });

  const id = await getIdFromCode(db, code);

  const setClauses = [];
  if (point) {
    setClauses.push(...getSetClausesForGeoFields('point', point));
  } else if (region) {
    setClauses.push(...getSetClausesForGeoFields('region', region));
  }
  if (setClauses.length > 0) {
    const result = await db.runSql(`UPDATE entity SET ${setClauses.join(',')} WHERE id = '${id}';`);
  }

  if (entityType !== 'village') await insertEntityRelation(db, parentId, id, hierarchyId);

  return id;
};

const insertEntityRelation = async (db, parentId, childId, hierarchyId) => {
  const result = await db.runSql(`
      insert into entity_relation (id, parent_id, child_id, entity_hierarchy_id)
      values (
        '${generateId()}',
        '${parentId}',
        '${childId}',
        '${hierarchyId}'
      );
    `);
};

const updateVillageAltHeirarchies = async (db, villages, subcatchmentIdMap, heirarchyId) => {
  villages.map(async village => {
    const childId = await getIdFromCode(db, village.code);
    const parentId = subcatchmentIdMap[village.parent_code];
    await insertEntityRelation(db, parentId, childId, heirarchyId);
  });
};

exports.up = async function (db) {
  const hierarchyId = await getHeirarchyId(db);

  const provincesWithData = addGeoDataToEntities(
    FIJI_ENTITIES_PROVINCES,
    convertFeaturesToMap(FIJI_ENTITIES_PROVINCES_GEODATA.features),
  );
  // console.log('provincesWithData', provincesWithData);
  const provinceIdMap = await insertEntities(db, provincesWithData, hierarchyId);

  const subCatchmentsWithData = addGeoDataToEntities(
    FIJI_ENTITIES_SUB_CATCHMENTS,
    convertFeaturesToMap(FIJI_ENTITIES_SUBCATCHMENTS_GEODATA.features),
  );
  // console.log('subCatchmentsWithData', subCatchmentsWithData);

  const subcatchmentIdMap = await insertEntities(
    db,
    FIJI_ENTITIES_SUB_CATCHMENTS, // subCatchmentsWithData,
    hierarchyId,
    provinceIdMap,
  );

  // console.log('FIJI_ENTITIES_NEW_VILLAGES', FIJI_ENTITIES_NEW_VILLAGES);
  const villageIdMap = await insertEntities(db, FIJI_ENTITIES_NEW_VILLAGES, subcatchmentIdMap);

  await updateVillageAltHeirarchies(
    db,
    FIJI_ENTITIES_VILLAGES_HEIRARCHIES,
    subcatchmentIdMap,
    hierarchyId,
  );
};

exports.down = async function (db) {
  // Delete children first to avoid parent_id reference conflicts
  await deleteEntityRelations(db);
  await deleteEntities(db, FIJI_ENTITIES_NEW_VILLAGES);
  await deleteEntities(db, FIJI_ENTITIES_SUB_CATCHMENTS);
  await deleteEntities(db, FIJI_ENTITIES_PROVINCES);
};

exports._meta = {
  version: 1,
};
