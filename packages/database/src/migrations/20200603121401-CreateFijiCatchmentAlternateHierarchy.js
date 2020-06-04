'use strict';

import { insertObject, arrayToDbString, generateId } from '../utilities';
import { FIJI_ENTITIES_PROVINCES } from './migrationData/20200603121401-CreateFijiAlternateHierarchyProvinces';
import { FIJI_ENTITIES_SUB_CATCHMENTS } from './migrationData/20200603121401-CreateFijiAlternateHierarchyCatchments';
import { FIJI_ENTITIES_NEW_VILLAGES } from './migrationData/20200603121401-CreateFijiAlternateHierarchyVillages';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const COUNTRY_CODE = 'FJ';

const parentCodeToId = async (db, parentCode) => {
  const record = await db.runSql(`SELECT id FROM entity WHERE code = '${parentCode}'`);
  return record.rows[0] && record.rows[0].id;
};

const getSetClausesForGeoFields = (fieldName, fieldValue) => [
  `"${fieldName}" = ST_GeomFromGeoJSON('${JSON.stringify(fieldValue)}')`,
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

const insertEntities = async (db, entities, ParentIdMap = {}) => {
  const idMap = await entities.map(async entity => await insertEntity(db, entity, ParentIdMap));
  return idMap;
};

const insertEntity = async (db, entity, parentIdMap) => {
  const { parent_code: parentCode, point, region, ...entityData } = entity;
  const parentId = parentIdMap.hasOwnProperty(parentCode)
    ? parentIdMap[parentCode]
    : await parentCodeToId(db, parentCode);

  await insertObject(db, 'entity', {
    ...entityData,
    id: generateId(),
    parent_id: parentId,
    country_code: COUNTRY_CODE,
    metadata: { dhis: { isDataRegional: true } },
  });
  const result = await db.runSql(`SELECT id FROM entity WHERE code = '${entity.code}'`);
  const id = result.rows[0].id;

  const setClauses = [];
  if (point) {
    setClauses.push(...getSetClausesForGeoFields('point', point));
  } else if (region) {
    setClauses.push(...getSetClausesForGeoFields('region', region));
  }
  if (setClauses.length > 0) {
    await db.runSql(`UPDATE entity SET ${setClauses.join(',')} WHERE id = '${id}';`);
  }
  const { code } = entity;
  return { code: id };
};

exports.up = async function(db) {
  // console.log('FIJI_ENTITIES_PROVINCES', FIJI_ENTITIES_PROVINCES);
  const provinceIdMap = await insertEntities(db, FIJI_ENTITIES_PROVINCES);

  //console.log('FIJI_ENTITIES_SUB_CATCHMENTS', FIJI_ENTITIES_SUB_CATCHMENTS);
  const subcatchmentIdMap = await insertEntities(db, FIJI_ENTITIES_SUB_CATCHMENTS, provinceIdMap);

  // console.log('FIJI_ENTITIES_NEW_VILLAGES', FIJI_ENTITIES_NEW_VILLAGES);
  await insertEntities(db, FIJI_ENTITIES_NEW_VILLAGES, subcatchmentIdMap);
};

exports.down = async function(db) {
  // Delete children first to avoid parent_id reference conflicts
  await deleteEntities(db, FIJI_ENTITIES_NEW_VILLAGES);
  await deleteEntities(db, FIJI_ENTITIES_SUB_CATCHMENTS);
  await deleteEntities(db, FIJI_ENTITIES_PROVINCES);
};

exports._meta = {
  version: 1,
};
