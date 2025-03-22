'use strict';

import { generateId, codeToId, insertObject, nameToId } from '../utilities';

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
const COUNTRY_CODE = 'PG';
const PROJECT_CODE = 'strive';
const FIELD_STATION = 'field_station';

const ENTITIES_TO_ADD = [
  {
    name: 'Central Province vector collection sites',
    code: 'PG_VC_01',
    latitude: -9.1889,
    longitude: 147.0053,
  },
  {
    name: 'East New Britain vector collection sites',
    code: 'PG_VC_02',
    latitude: -4.304,
    longitude: 152.1352,
  },
  {
    name: 'East Sepik vector collection sites',
    code: 'PG_VC_03',
    latitude: -3.6244,
    longitude: 143.5958,
  },
  {
    name: 'North Coast vector collection sites ',
    code: 'PG_VC_04',
    latitude: -4.8525,
    longitude: 145.7731,
  },
  {
    name: 'Lihir Island vector collection sites ',
    code: 'PG_VC_05',
    latitude: -3.1213,
    longitude: 152.5987,
  },
];

const RELATIONS_TO_ADD = [
  {
    parentCode: 'PG',
    childCode: 'PG_Central',
  },
  {
    parentCode: 'PG',
    childCode: 'PG_East New Britain',
  },
  {
    parentCode: 'PG',
    childCode: 'PG_East Sepik',
  },
  {
    parentCode: 'PG_Central',
    childCode: 'PG_VC_01',
  },
  {
    parentCode: 'PG_East New Britain',
    childCode: 'PG_VC_02',
  },
  {
    parentCode: 'PG_East Sepik',
    childCode: 'PG_VC_03',
  },
  {
    parentCode: 'PG_Madang',
    childCode: 'PG_VC_04',
  },
  {
    parentCode: 'PG_New Ireland',
    childCode: 'PG_VC_05',
  },
];

const insertEntity = async (db, entity) => {
  const parentId = await codeToId(db, 'entity', entity.parentCode);
  await insertObject(db, 'entity', {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    type: FIELD_STATION,
    country_code: COUNTRY_CODE,
  });
};

const updatePoint = async (db, entity) => {
  const point = JSON.stringify({ type: 'Point', coordinates: [entity.longitude, entity.latitude] });
  return db.runSql(`
    update entity 
    set point = ST_Force2D(ST_GeomFromGeoJSON('${point}')),
    bounds = ST_Expand(ST_Envelope(ST_GeomFromGeoJSON('${point}')::geometry), 1)
    where id = '${entity.id}';
  `);
};

exports.up = async function (db) {
  for (const entity of ENTITIES_TO_ADD) {
    const id = generateId();
    await insertEntity(db, { id, ...entity });
    await updatePoint(db, { id, ...entity });
  }

  const entityHierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);
  for (const { childCode, parentCode } of RELATIONS_TO_ADD) {
    const parentId = await codeToId(db, 'entity', parentCode);
    const childId = await codeToId(db, 'entity', childCode);
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: parentId,
      child_id: childId,
      entity_hierarchy_id: entityHierarchyId,
    });
  }
};

exports.down = async function (db) {
  for (const { childCode, parentCode } of RELATIONS_TO_ADD) {
    const parentId = await codeToId(db, 'entity', parentCode);
    const childId = await codeToId(db, 'entity', childCode);
    await db.runSql(`
      delete from entity_relation where child_id = '${childId}' and parent_id = '${parentId}';
    `);
  }

  for (const { code } of ENTITIES_TO_ADD) {
    const id = await codeToId(db, 'entity', code);
    await db.runSql(`
      delete from entity where id = '${id}' and country_code = '${COUNTRY_CODE}';
    `);
  }
};

exports._meta = {
  version: 1,
};
