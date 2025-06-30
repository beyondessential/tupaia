'use strict';

import { generateId, codeToId, insertObject, nameToId } from '../utilities';
import Entities from './migrationData/20220518002531-AddFacilityEntitiesForImpactHealth-modifies-data.js/entities.json';

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
const PROJECT_CODE = 'impact_health';
const facilityTypeNames = [
  'Aidpost',
  'Clinic',
  'Health Centre',
  'District Hospital',
  'Referral Hospital',
];

const insertEntity = async (db, entity) => {
  return insertObject(db, 'entity', {
    id: entity.id,
    code: entity.code,
    name: entity.name,
    type: entity.entity_type,
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
  const FACILITIES = Entities.filter(entity => entity.entity_type === 'facility');

  for (const entity of FACILITIES) {
    const id = generateId();
    await insertEntity(db, { id, ...entity });
    if (entity.latitude) {
      await updatePoint(db, { id, ...entity });
    }
    await db.runSql(`
      UPDATE entity
      SET attributes = jsonb_insert(attributes, '{facility_type}', '${entity.facility_type}')
      WHERE code = '${entity.code}'
    `);
    await db.runSql(`
      UPDATE entity
      SET attributes = jsonb_insert(attributes, '{facility_type_name}', '"${
        facilityTypeNames[entity.facility_type - 1]
      }"')
      WHERE code = '${entity.code}'
    `);
  }

  const entityHierarchyId = await nameToId(db, 'entity_hierarchy', PROJECT_CODE);

  for (const { code, parent_code } of FACILITIES) {
    const parentId = await codeToId(db, 'entity', parent_code);
    const childId = await codeToId(db, 'entity', code);
    await insertObject(db, 'entity_relation', {
      id: generateId(),
      parent_id: parentId,
      child_id: childId,
      entity_hierarchy_id: entityHierarchyId,
    });
  }
};

exports.down = async function (db) {
  const FACILITIES = Entities.filter(entity => entity.entity_type === 'facility');
  for (const { code, parent_code } of FACILITIES) {
    const parentId = await codeToId(db, 'entity', parent_code);
    const childId = await codeToId(db, 'entity', code);
    await db.runSql(`
      delete from entity_relation where child_id = '${childId}' and parent_id = '${parentId}';
    `);
  }

  for (const { code } of FACILITIES) {
    const id = await codeToId(db, 'entity', code);
    await db.runSql(`
      delete from entity where id = '${id}' and country_code = '${COUNTRY_CODE}';
    `);
  }
};

exports._meta = {
  version: 1,
};
