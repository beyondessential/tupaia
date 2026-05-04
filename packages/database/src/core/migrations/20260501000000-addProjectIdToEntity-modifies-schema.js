'use strict';

var dbm;
var type;
var seed;

/**
 * RN-1853 schema migration. Adds `entity.project_id` and the supporting
 * UNIQUE(code, project_id) constraint so the data migration that follows can repoint
 * rows and bulk-insert per-project duplicates.
 *
 * The matching CHECK constraint (sub-country rows must have project_id NOT NULL,
 * structural rows must have it NULL) is applied at the end of the data migration —
 * it is data-dependent and would fail here, before the backfill runs.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  // Add nullable project_id column + supporting index.
  await db.runSql(`
    ALTER TABLE entity
      ADD COLUMN project_id TEXT REFERENCES project(id) ON DELETE RESTRICT;
  `);
  await db.runSql(`CREATE INDEX entity_project_id_idx ON entity(project_id);`);

  // Drop the global UNIQUE(code) — sub-country codes will repeat across projects, so
  // it's superseded by UNIQUE(code, project_id) below. The dashboard FK that depends
  // on entity_code_key has to go first; after this migration dashboard.root_entity_code
  // is a soft text reference (no longer enforced).
  await db.runSql(
    `ALTER TABLE dashboard DROP CONSTRAINT IF EXISTS dashboard_root_entity_code_fkey;`,
  );
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_code_key;`);

  // Apply UNIQUE(code, project_id) before the data migration runs. Postgres treats NULL
  // as distinct in unique constraints, so existing rows (all NULL project_id pre-data)
  // are not uniqueness-checked — they keep their codes. The constraint also creates a
  // btree index on (code, project_id) that the data migration's repoint UPDATEs rely on.
  await db.runSql(`
    ALTER TABLE entity ADD CONSTRAINT entity_code_project_id_unique
      UNIQUE (code, project_id);
  `);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE entity DROP CONSTRAINT IF EXISTS entity_code_project_id_unique;`);
  await db.runSql(`DROP INDEX IF EXISTS entity_project_id_idx;`);
  await db.runSql(`ALTER TABLE entity DROP COLUMN IF EXISTS project_id;`);
  await db.runSql(`ALTER TABLE entity ADD CONSTRAINT entity_code_key UNIQUE (code);`);
  await db.runSql(`
    ALTER TABLE dashboard
      ADD CONSTRAINT dashboard_root_entity_code_fkey
      FOREIGN KEY (root_entity_code) REFERENCES entity(code) ON UPDATE CASCADE ON DELETE RESTRICT;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
