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
    CREATE TABLE dashboard_item (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      config JSONB NOT NULL DEFAULT '{}',
      report_code TEXT,
      legacy BOOLEAN NOT NULL DEFAULT 'false'
    );
  `);
  await db.runSql(`
    CREATE TABLE legacy_report (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      data_builder TEXT,
      data_builder_config JSONB,
      data_services JSONB DEFAULT '[{"isDataRegional": true}]'
    );
  `);
  await db.runSql(`
    CREATE TABLE dashboard (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      root_entity_code TEXT NOT NULL,
      sort_order INTEGER,
      FOREIGN KEY (root_entity_code) REFERENCES entity (code) ON UPDATE CASCADE ON DELETE RESTRICT
    );
  `);
  await db.runSql(`
    CREATE TABLE dashboard_relation (
      id TEXT PRIMARY KEY,
      dashboard_id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      entity_types entity_type[] NOT NULL CONSTRAINT entity_types_not_empty CHECK (entity_types <> '{}'),
      project_codes TEXT[] NOT NULL CONSTRAINT project_codes_not_empty CHECK (project_codes <> '{}'),
      permission_groups TEXT[] NOT NULL CONSTRAINT permission_groups_not_empty CHECK (permission_groups <> '{}'),
      sort_order INTEGER,
      FOREIGN KEY (dashboard_id) REFERENCES dashboard (id) ON UPDATE CASCADE ON DELETE RESTRICT,
      FOREIGN KEY (child_id) REFERENCES dashboard_item (id) ON UPDATE CASCADE ON DELETE CASCADE
    );
  `);
};

exports.down = async function (db) {
  await db.runSql(`
    DROP TABLE dashboard_relation;
    DROP TABLE dashboard;
    DROP TABLE legacy_report;
    DROP TABLE dashboard_item;
  `);
};

exports._meta = {
  version: 1,
};
