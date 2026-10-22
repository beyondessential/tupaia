'use strict';

var dbm;
var type;
var seed;

/**
 * Order matters — `entity_hierarchy` is referenced by `project.entity_hierarchy_id`,
 * `entity_relation.entity_hierarchy_id`, and
 * `entity_parent_child_relation.entity_hierarchy_id`. Drop the dependents first.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE project DROP COLUMN IF EXISTS entity_hierarchy_id;
  `);

  await db.runSql(`DROP TABLE IF EXISTS entity_parent_child_relation;`);
  await db.runSql(`DROP TABLE IF EXISTS entity_relation;`);

  await db.runSql(`DROP TABLE IF EXISTS entity_hierarchy;`);
};

exports.down = async function (db) {
  await db.runSql(`
    CREATE TABLE entity_hierarchy (
      id TEXT NOT NULL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      canonical_types TEXT[] DEFAULT '{}',
      updated_at_sync_tick BIGINT NOT NULL DEFAULT 0
    );
  `);
  await db.runSql(`
    CREATE INDEX entity_hierarchy_updated_at_sync_tick_index
      ON entity_hierarchy(updated_at_sync_tick);
  `);

  await db.runSql(`
    ALTER TABLE project
      ADD COLUMN entity_hierarchy_id TEXT REFERENCES entity_hierarchy(id);
  `);

  await db.runSql(`
    INSERT INTO entity_hierarchy (id, name)
    SELECT p.id, p.code
    FROM project p;
  `);
  await db.runSql(`
    UPDATE project SET entity_hierarchy_id = id;
  `);

  await db.runSql(`
    CREATE TABLE entity_relation (
      id TEXT NOT NULL PRIMARY KEY,
      parent_id TEXT NOT NULL REFERENCES entity(id),
      child_id TEXT NOT NULL REFERENCES entity(id),
      entity_hierarchy_id TEXT NOT NULL REFERENCES entity_hierarchy(id)
    );
  `);

  await db.runSql(`
    CREATE TABLE entity_parent_child_relation (
      id TEXT NOT NULL PRIMARY KEY,
      parent_id TEXT NOT NULL REFERENCES entity(id) ON UPDATE CASCADE ON DELETE CASCADE,
      child_id TEXT NOT NULL REFERENCES entity(id) ON UPDATE CASCADE ON DELETE CASCADE,
      entity_hierarchy_id TEXT NOT NULL REFERENCES entity_hierarchy(id) ON UPDATE CASCADE ON DELETE CASCADE,
      updated_at_sync_tick BIGINT NOT NULL DEFAULT 0,
      UNIQUE (entity_hierarchy_id, parent_id, child_id)
    );
  `);
  await db.runSql(`
    CREATE INDEX entity_parent_child_relation_updated_at_sync_tick_index
      ON entity_parent_child_relation(updated_at_sync_tick);
  `);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
