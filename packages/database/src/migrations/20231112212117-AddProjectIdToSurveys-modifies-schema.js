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
    ALTER TABLE survey
    ADD COLUMN project_id TEXT,
    ADD FOREIGN KEY (project_id) REFERENCES project(id); 
  `);

  await db.runSql(` 
  CREATE INDEX survey_project_id_idx ON survey USING btree (project_id);
`);
};

exports.down = async function (db) {
  await db.runSql(`
  ALTER TABLE survey DROP COLUMN project_id;
`);
  await db.runSql(`DROP INDEX IF EXISTS survey_project_id_idx;`);
};

exports._meta = {
  version: 1,
};
