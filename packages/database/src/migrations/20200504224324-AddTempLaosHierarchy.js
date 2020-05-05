'use strict';

import { TupaiaDatabase } from '@tupaia/database';
import { insertObject, arrayToDbString, generateId } from '../utilities';
import { LAOS_ENTITIES } from './migrationData/20200504224324-AddTempLaosHierarchy';

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

exports.up = async function(db) {
  for (const entity of LAOS_ENTITIES) {
    const { parent_code: parentCode, point, region, ...entityData } = entity;
    const parentId = await parentCodeToId(db, parentCode);

    await insertObject(db, 'entity', {
      ...entityData,
      id: generateId(),
      parent_id: parentId,
      country_code: 'LA',
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
  const codes = LAOS_ENTITIES.map(({ code }) => code);
  await db.runSql(`DELETE FROM entity WHERE code IN (${arrayToDbString(codes)})`);
};

exports._meta = {
  version: 1,
};
