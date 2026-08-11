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

exports.up = async function (db) {
  await db.runSql(`
    CREATE INDEX entity_parent_child_relation_hierarchy_child_parent_idx
      ON entity_parent_child_relation (entity_hierarchy_id, child_id, parent_id);
  `);
  await db.runSql(`
    CREATE INDEX entity_parent_child_relation_hierarchy_parent_child_idx
      ON entity_parent_child_relation (entity_hierarchy_id, parent_id, child_id);
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
