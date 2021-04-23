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

const ENTITY_RELATION_UPOLU_EXPLORE = {
  id: generateId(),
  parent_id: '5df1b88c61f76a485cd1ca09',
  child_id: '5df1b88c61f76a485cd7815a',
  entity_hierarchy_id: '5e9d06e261f76a30c400001b',
};

const ENTITY_RELATION_SAVAII_EXPLORE = {
  id: generateId(),
  parent_id: '5df1b88c61f76a485cd1ca09',
  child_id: '5df1b88c61f76a485ce4e6b1',
  entity_hierarchy_id: '5e9d06e261f76a30c400001b',
};

exports.up = async function(db) {
  await insertObject(db, 'entity', NEW_UNKNOWN_DISTRICT_ENTITY);
  await insertObject(db, 'entity', NEW_UNKNOWN_FACILITY_ENTITY);
  await insertObject(db, 'entity', NEW_UNKNOWN_VILLAGE_ENTITY);
  await insertObject(db, 'entity_relation', ENTITY_RELATION_UPOLU_EXPLORE);
  await insertObject(db, 'entity_relation', ENTITY_RELATION_SAVAII_EXPLORE);
};

exports.down = async function(db) {
  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "parent_id" = '${ENTITY_RELATION_UPOLU_EXPLORE.parent_id}'
    AND "child_id" = '${ENTITY_RELATION_UPOLU_EXPLORE.child_id}'
    AND "entity_hierarchy_id" = '${ENTITY_RELATION_UPOLU_EXPLORE.entity_hierarchy_id}';
  `);
  await db.runSql(`
    DELETE FROM "entity_relation"
    WHERE "parent_id" = '${ENTITY_RELATION_SAVAII_EXPLORE.parent_id}'
    AND "child_id" = '${ENTITY_RELATION_SAVAII_EXPLORE.child_id}'
    AND "entity_hierarchy_id" = '${ENTITY_RELATION_SAVAII_EXPLORE.entity_hierarchy_id}';
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
