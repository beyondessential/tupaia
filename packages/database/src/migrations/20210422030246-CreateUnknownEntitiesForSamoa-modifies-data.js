'use strict';

import { insertObject } from '../utilities';
import { generateId } from '../utilities/generateId';

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

const NEW_UNKNOWN_DISTRICT_ENTITY = {
  id: generateId(),
  code: 'WS_Unknown_District',
  parent_id: '5df1b88c61f76a485cd1ca09',
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

const TEST_ENTITY_RELATION_UPOLO = {
  id: 'TEST_ENTITY_RELATION_UPOLO',
  parent_id: '5df1b88c61f76a485cd1ca09',
  child_id: '5df1b88c61f76a485cd7815a',
  entity_hierarchy_id: '5e9d06e261f76a30c400001b',
};

const TEST_ENTITY_RELATION_SAVAII = {
  id: 'TEST_ENTITY_RELATION_SAVAII',
  parent_id: '5df1b88c61f76a485cd1ca09',
  child_id: '5df1b88c61f76a485ce4e6b1',
  entity_hierarchy_id: '5e9d06e261f76a30c400001b',
};

exports.up = async function(db) {
  await insertObject(db, 'entity', NEW_UNKNOWN_DISTRICT_ENTITY);
  await insertObject(db, 'entity', NEW_UNKNOWN_FACILITY_ENTITY);
  await insertObject(db, 'entity', NEW_UNKNOWN_VILLAGE_ENTITY);
  await insertObject(db, 'entity_relation', TEST_ENTITY_RELATION_UPOLO);
  await insertObject(db, 'entity_relation', TEST_ENTITY_RELATION_SAVAII);
};

exports.down = async function(db) {
  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "id" = 'TEST_ENTITY_RELATION_UPOLO';
  `);
  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "id" = 'TEST_ENTITY_RELATION_SAVAII';
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
  "version": 1
};
