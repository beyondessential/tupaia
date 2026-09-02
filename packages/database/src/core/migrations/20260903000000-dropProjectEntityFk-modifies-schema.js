'use strict';

var dbm;
var type;
var seed;

/**
 * `entity.project_id -> project(id)` (epic) and `project.entity_id -> entity(id)` (dev's
 * AddSyncedTablesMissingFKConstraints) form a mutual foreign-key cycle. A cycle has no acyclic
 * insert order, so sync's dependency sort (sortModelsByDependencyOrder) can't order the affected
 * tables — which broke both the sort itself and forced makeEntityProjectFksDeferrable's deferral.
 *
 * Break the cycle at the schema level by dropping the legacy reverse edge project.entity_id ->
 * entity. That relationship is being retired (TUP-3184); dropping the constraint turns the column
 * into a soft reference. With the cycle gone, sync orders project before entity, so
 * entity.project_id -> project is satisfied by an immediate check and no longer needs deferral —
 * this migration also supersedes makeEntityProjectFksDeferrable (removed) by reverting that edge to
 * non-deferrable on databases that had already applied it.
 *
 * Applies to server and browser (PGlite) — both carry these constraints.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    DO $$
    BEGIN
      -- Drop the legacy reverse edge; do not re-add.
      ALTER TABLE project DROP CONSTRAINT IF EXISTS project_entity_id_fkey;

      -- Revert the remaining edge to non-deferrable (undo makeEntityProjectFksDeferrable) where it
      -- was made deferrable. Catalog-only change, no revalidation.
      IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'entity_project_id_fkey' AND condeferrable
      ) THEN
        ALTER TABLE entity
          ALTER CONSTRAINT entity_project_id_fkey NOT DEFERRABLE INITIALLY IMMEDIATE;
      END IF;
    END $$;
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_entity_id_fkey') THEN
        ALTER TABLE project
          ADD CONSTRAINT project_entity_id_fkey
          FOREIGN KEY (entity_id) REFERENCES entity(id) ON UPDATE CASCADE ON DELETE RESTRICT;
      END IF;
    END $$;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
