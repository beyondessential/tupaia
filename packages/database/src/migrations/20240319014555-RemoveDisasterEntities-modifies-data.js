'use strict';

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

// Remove disaster entities, where disaster is the entity code (project entity) or type
const removeEntities = async db => {
  return db.runSql(`
    DELETE FROM "entity" WHERE "code" = 'disaster' OR "type" = 'disaster'; 
  `);
};

// Remove disaster entity hierarchy
const removeEntityHierarchy = async db => {
  return db.runSql(`
    DELETE FROM "entity_hierarchy" WHERE "name" = 'disaster';
    `);
};

// Remove disaster entity relations
const removeEntityRelations = async db => {
  const { rows } = await db.runSql(`
    SELECT * FROM "entity" WHERE "code" = 'disaster';
    `);
  const projectEntity = rows[0];
  if (!projectEntity) return;

  await db.runSql(`
    DELETE FROM "entity_relation" WHERE "parent_id" = '${projectEntity.id}';
  `);
};

exports.up = async function (db) {
  await removeEntityRelations(db);
  await removeEntities(db);
  await removeEntityHierarchy(db);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
