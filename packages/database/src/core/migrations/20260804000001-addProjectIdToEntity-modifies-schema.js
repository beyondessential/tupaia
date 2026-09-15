'use strict';

var dbm;
var type;
var seed;

/**
 *  Adds `entity.project_id` and the supporting
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

  // Drop the global UNIQUE(code) — sub-country codes will repeat across projects, so it's
  // superseded by UNIQUE(code, project_id) below. entity.code can no longer be the target of
  // a single-column foreign key, so every FK that references entity(code) has to go first;
  // those columns become soft text references (no longer enforced). Databases carry different
  // drift here — dashboard.root_entity_code, the legacy data_element_data_service.country_code,
  // possibly others — so drop them dynamically rather than by name. Browser (PGlite) targets
  // have none of these tables, so the loop is a no-op there.
  await db.runSql(`
    DO $$
    DECLARE
      fk RECORD;
    BEGIN
      FOR fk IN
        SELECT c.conrelid::regclass AS tbl, c.conname
        FROM pg_constraint c
        WHERE c.contype = 'f'
          AND c.confrelid = 'entity'::regclass
          AND (SELECT attnum FROM pg_attribute
               WHERE attrelid = 'entity'::regclass AND attname = 'code') = ANY (c.confkey)
      LOOP
        EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', fk.tbl, fk.conname);
        RAISE NOTICE 'Dropped FK % on % (referenced entity(code))', fk.conname, fk.tbl;
      END LOOP;
    END $$;
  `);
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
    DO $$
    BEGIN
      IF to_regclass('dashboard') IS NOT NULL THEN
        ALTER TABLE dashboard
          ADD CONSTRAINT dashboard_root_entity_code_fkey
          FOREIGN KEY (root_entity_code) REFERENCES entity(code) ON UPDATE CASCADE ON DELETE RESTRICT;
      END IF;
    END $$;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
