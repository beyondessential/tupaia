'use strict';

import { codeToId, insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

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

const NEW_UNKNOWN_DISTRICT_ENTITY = {
  id: generateId(),
  code: 'WS_Unknown_District',
  name: 'Unknown District',
  type: 'district',
  country_code: 'WS',
  metadata: '{"dhis": {"isDataRegional": true}}',
  attributes: '{}',
};

const NEW_UNKNOWN_FACILITY_ENTITY = {
  id: generateId(),
  code: 'WS_Unknown_Facility',
  parent_id: `${NEW_UNKNOWN_DISTRICT_ENTITY.id}`,
  name: 'Unknown Facility',
  type: 'facility',
  country_code: 'WS',
  metadata: '{"dhis": {"isDataRegional": true}}',
  attributes: '{}',
};

const NEW_UNKNOWN_VILLAGE_ENTITY = {
  id: generateId(),
  code: 'WS_Unknown_Village',
  parent_id: `${NEW_UNKNOWN_FACILITY_ENTITY.id}`,
  name: 'Unknown Village',
  type: 'village',
  country_code: 'WS',
  metadata: '{"dhis": {"isDataRegional": true}}',
  attributes: '{}',
};

exports.up = async function (db) {
  const selectExploreEntityHierarchy = await db.runSql(`
    SELECT id FROM entity_hierarchy WHERE name = 'explore';
  `);
  const [exploreEntityHierarchy] = selectExploreEntityHierarchy.rows;
  const exploreEntityHierarchyId = exploreEntityHierarchy.id;

  await insertObject(db, 'entity', {
    ...NEW_UNKNOWN_DISTRICT_ENTITY,
    parent_id: await codeToId(db, 'entity', 'WS'),
  });
  await insertObject(db, 'entity', NEW_UNKNOWN_FACILITY_ENTITY);
  await insertObject(db, 'entity', NEW_UNKNOWN_VILLAGE_ENTITY);
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', 'WS'),
    child_id: await codeToId(db, 'entity', 'WS_Upolu'),
    entity_hierarchy_id: exploreEntityHierarchyId,
  });
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', 'WS'),
    child_id: await codeToId(db, 'entity', 'WS_Savaii'),
    entity_hierarchy_id: exploreEntityHierarchyId,
  });
};

exports.down = async function (db) {
  const selectExploreEntityHierarchy = await db.runSql(`
    SELECT id FROM entity_hierarchy WHERE name = 'explore';
  `);
  const [exploreEntityHierarchy] = selectExploreEntityHierarchy.rows;
  const exploreEntityHierarchyId = exploreEntityHierarchy.id;

  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "parent_id" = '${await codeToId(db, 'entity', 'WS')}'
    AND "child_id" = '${await codeToId(db, 'entity', 'WS_Upolu')}'
    AND "entity_hierarchy_id" = '${exploreEntityHierarchyId}';
  `);
  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "parent_id" = '${await codeToId(db, 'entity', 'WS')}'
    AND "child_id" = '${await codeToId(db, 'entity', 'WS_Savaii')}'
    AND "entity_hierarchy_id" = '${exploreEntityHierarchyId}';
  `);
  await db.runSql(`
    DELETE FROM "entity"
    WHERE "code" = 'WS_Unknown_Village';
  `);
  await db.runSql(`
    DELETE FROM "entity"
    WHERE "code" = 'WS_Unknown_Facility';
  `);
  await db.runSql(`
    DELETE FROM "entity"
    WHERE "code" = 'WS_Unknown_District';
  `);
};

exports._meta = {
  version: 1,
};
