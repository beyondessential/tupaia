'use strict';

var dbm;
var type;
var seed;

exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function (db) {
  await db.runSql(`
    CREATE TABLE project_country (
      id TEXT NOT NULL PRIMARY KEY,
      project_id TEXT NOT NULL REFERENCES project(id) ON UPDATE CASCADE ON DELETE CASCADE,
      country_id TEXT NOT NULL REFERENCES entity(id) ON UPDATE CASCADE ON DELETE RESTRICT,
      updated_at_sync_tick BIGINT NOT NULL DEFAULT 0,
      UNIQUE (project_id, country_id)
    );
  `);
  await db.runSql(`CREATE INDEX project_country_country_id_idx ON project_country(country_id);`);
  await db.runSql(`
    CREATE INDEX project_country_updated_at_sync_tick_index
      ON project_country(updated_at_sync_tick);
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE IF EXISTS project_country;`);
};

exports._meta = {
  version: 1,
  targets: ['server', 'browser'],
};
