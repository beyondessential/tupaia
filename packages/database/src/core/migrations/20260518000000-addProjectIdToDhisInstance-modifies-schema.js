'use strict';

var dbm;
var type;
var seed;

/**
 * TUP-3156. Adds a nullable `project_id` to `dhis_instance`.
 *
 * Each DHIS2 instance is conceptually assigned to one project (per the ticket
 * refinement). This column scaffolds that association so admins can set it
 * via the admin panel and so future code can:
 *   - validate that pushed entities belong to the same project as the instance
 *   - route entity-code lookups via findOneByCodeInProject(code, instance.project_id)
 *
 * Nullable for now — existing instances have no project assigned. The follow-up
 * to enforce NOT NULL + backfill happens when the admin panel UI for setting
 * project_id is in place and instances are reviewed manually.
 *
 * Filename suffix `-modifies-schema.js` so setupNewDatabase.sh runs it on
 * fresh test DBs.
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    ALTER TABLE dhis_instance
      ADD COLUMN project_id TEXT REFERENCES project(id) ON DELETE SET NULL;
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    ALTER TABLE dhis_instance DROP COLUMN IF EXISTS project_id;
  `);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
