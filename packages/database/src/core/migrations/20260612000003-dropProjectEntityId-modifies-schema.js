'use strict';

var dbm;
var type;
var seed;

/**
 * Final step of phasing out project entities: `project.name` is now populated, so
 * make it NOT NULL, and drop the now-dangling `project.entity_id` column (its FK
 * is dropped with the column).
 */

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`ALTER TABLE project ALTER COLUMN name SET NOT NULL;`);
  await db.runSql(`ALTER TABLE project DROP COLUMN IF EXISTS entity_id;`);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE project ADD COLUMN IF NOT EXISTS entity_id TEXT REFERENCES entity(id);`);
  await db.runSql(`ALTER TABLE project ALTER COLUMN name DROP NOT NULL;`);
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
