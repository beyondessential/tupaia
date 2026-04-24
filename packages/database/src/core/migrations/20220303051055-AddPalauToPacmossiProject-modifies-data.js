'use strict';

import { insertObject, codeToId, generateId, deleteObject } from '../utilities';

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

const COUNTRY_CODE = 'PW';
const PROJECT_CODE = 'pacmossi';

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const addEntityRelation = async db => {
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', PROJECT_CODE),
    child_id: await codeToId(db, 'entity', COUNTRY_CODE),
    entity_hierarchy_id: await hierarchyNameToId(db, PROJECT_CODE),
  });
};

const deleteEntityRelation = async db => {
  const parentId = await codeToId(db, 'entity', PROJECT_CODE);
  const childId = await codeToId(db, 'entity', COUNTRY_CODE);
  await deleteObject(db, 'entity_relation', { parent_id: parentId, child_id: childId });
};

exports.up = async function (db) {
  await addEntityRelation(db);
};

exports.down = async function (db) {
  await deleteEntityRelation(db);
};

exports._meta = {
  version: 1,
};
