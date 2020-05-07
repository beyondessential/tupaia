'use strict';

import { insertObject, arrayToDbString, generateId } from '../utilities';
// import { FIJI_ENTITIES } from './migrationData/20200506221510-create-catchment-village-hierachy.js';
import { FIJI_ENTITIES } from './migrationData/temp.js';

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

const deleteEntitiesWithCodes = async (db, codes) =>
  await db.runSql(`DELETE FROM entity WHERE code IN (${arrayToDbString(codes)})`);

exports.up = async function(db) {
  console.log("FIJI_ENTITIES", FIJI_ENTITIES);
  for (const entity of FIJI_ENTITIES) {
    const { parent_code: parentCode, point, region, ...entityData } = entity;
    const parentId = await parentCodeToId(db, parentCode);

    await insertObject(db, 'entity', {
      ...entityData,
      id: generateId(),
      parent_id: parentId,
      country_code: COUNTRY_CODE,
      metadata: { dhis: { isDataRegional: true } },
    });

    const setClauses = [];
    if (point) {
      setClauses.push(...getSetClausesForGeoFields('point', point));
    } else if (region) {
      setClauses.push(...getSetClausesForGeoFields('region', region));
    }
    if (setClauses.length > 0) {
      await db.runSql(`UPDATE entity SET ${setClauses.join(',')} WHERE code = '${entity.code}';`);
    }
  }
};

exports.down = async function(db) {
  const entitiesByType = {};
  FIJI_ENTITIES.forEach(({ type, code }) => {
    if (!entitiesByType[type]) {
      entitiesByType[type] = [];
    }
    entitiesByType[type].push(code);
  });

  // Delete children first to avoid parent_id reference conflicts
  await deleteEntitiesWithCodes(db, entitiesByType.catchment);
  // await deleteEntitiesWithCodes(db, entitiesByType.village);
  // await deleteEntitiesWithCodes(db, entitiesByType.sub_district);
};

exports._meta = {
  version: 1,
};
