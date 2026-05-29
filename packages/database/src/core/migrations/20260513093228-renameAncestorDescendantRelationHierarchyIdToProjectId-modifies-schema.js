'use strict';

var dbm;
var type;
var seed;

/**
 * TUP-3066a. Renames `ancestor_descendant_relation.entity_hierarchy_id` to `project_id`.
 *
 * Each project has exactly one hierarchy, so the indirection through
 * `entity_hierarchy_id` is dead weight. After this migration the closure cache
 * is keyed directly by project, matching the new per-project entity model.
 *
 * Add-backfill-drop pattern. The cache is short-lived: if anything goes
 * sideways with the backfill, deleting the rows and letting
 * `AncestorDescendantCacheBuilder.rebuildAll()` repopulate is safe.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE ancestor_descendant_relation
      ADD COLUMN project_id TEXT REFERENCES project(id) ON DELETE CASCADE;
  `);

  await db.runSql(`
    UPDATE ancestor_descendant_relation a
      SET project_id = p.id
      FROM project p
      WHERE a.entity_hierarchy_id = p.entity_hierarchy_id;
  `);

  // Drop any orphan closure rows whose entity_hierarchy_id has no matching project.
  // The cache is rebuilt on next boot, so deleting stale rows is safe.
  await db.runSql(`DELETE FROM ancestor_descendant_relation WHERE project_id IS NULL;`);

  await db.runSql(`
    ALTER TABLE ancestor_descendant_relation
      ALTER COLUMN project_id SET NOT NULL,
      DROP COLUMN entity_hierarchy_id;
  `);

  await db.runSql(`
    CREATE INDEX ancestor_descendant_relation_project_id_idx
      ON ancestor_descendant_relation(project_id);
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE ancestor_descendant_relation
      ADD COLUMN entity_hierarchy_id TEXT REFERENCES entity_hierarchy(id) ON DELETE CASCADE;
  `);

  await db.runSql(`
    UPDATE ancestor_descendant_relation a
      SET entity_hierarchy_id = p.entity_hierarchy_id
      FROM project p
      WHERE a.project_id = p.id;
  `);

  await db.runSql(`
    ALTER TABLE ancestor_descendant_relation
      ALTER COLUMN entity_hierarchy_id SET NOT NULL,
      DROP COLUMN project_id;
  `);

  await db.runSql(`DROP INDEX IF EXISTS ancestor_descendant_relation_project_id_idx;`);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
