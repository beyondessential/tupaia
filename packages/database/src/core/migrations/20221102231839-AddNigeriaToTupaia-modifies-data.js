'use strict';

const { insertObject, generateId, codeToId } = require('../utilities');

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

const hierarchyNameToId = async (db, name) => {
  const record = await db.runSql(`SELECT id FROM entity_hierarchy WHERE name = '${name}'`);
  return record.rows[0] && record.rows[0].id;
};

const addEntityRelation = async db => {
  await insertObject(db, 'entity_relation', {
    id: generateId(),
    parent_id: await codeToId(db, 'entity', 'explore'),
    child_id: await codeToId(db, 'entity', 'NG'),
    entity_hierarchy_id: await hierarchyNameToId(db, 'explore'),
  });
};

exports.up = async function (db) {
  return addEntityRelation(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
