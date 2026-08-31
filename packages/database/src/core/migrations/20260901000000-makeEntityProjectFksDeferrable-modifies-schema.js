'use strict';

var dbm;
var type;
var seed;

/**
 * `entity.project_id -> project(id)` and `project.entity_id -> entity(id)` form a mutual
 * foreign-key cycle, so no acyclic insert order exists. Sync applies a whole changeset in
 * one transaction ordered by dependency (see sortModelsByDependencyOrder), but a cycle
 * can't be ordered, so one table is inserted before the other and an immediate FK check
 * fails the batch — this blocks the DataTrak PWA re-sync after the entity-hierarchy upgrade.
 *
 * Make both FKs DEFERRABLE INITIALLY DEFERRED so the checks run at COMMIT, by which point
 * both tables are fully populated and the set is consistent regardless of insert order.
 * Applies to server and browser (PGlite) — the client enforces the same FKs. Postgres can't
 * ALTER a constraint to deferrable in place, so each is dropped and re-added.
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
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'entity_project_id_fkey') THEN
        ALTER TABLE entity DROP CONSTRAINT entity_project_id_fkey;
        ALTER TABLE entity ADD CONSTRAINT entity_project_id_fkey
          FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE RESTRICT
          DEFERRABLE INITIALLY DEFERRED;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_entity_id_fkey') THEN
        ALTER TABLE project DROP CONSTRAINT project_entity_id_fkey;
        ALTER TABLE project ADD CONSTRAINT project_entity_id_fkey
          FOREIGN KEY (entity_id) REFERENCES entity(id) ON UPDATE CASCADE ON DELETE RESTRICT
          DEFERRABLE INITIALLY DEFERRED;
      END IF;
    END $$;
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DO $$
    BEGIN
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'entity_project_id_fkey') THEN
        ALTER TABLE entity DROP CONSTRAINT entity_project_id_fkey;
        ALTER TABLE entity ADD CONSTRAINT entity_project_id_fkey
          FOREIGN KEY (project_id) REFERENCES project(id) ON DELETE RESTRICT;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_entity_id_fkey') THEN
        ALTER TABLE project DROP CONSTRAINT project_entity_id_fkey;
        ALTER TABLE project ADD CONSTRAINT project_entity_id_fkey
          FOREIGN KEY (entity_id) REFERENCES entity(id) ON UPDATE CASCADE ON DELETE RESTRICT;
      END IF;
    END $$;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
