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

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE report (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      config JSONB NOT NULL,
      permission_group_id TEXT NOT NULL,
      FOREIGN KEY (permission_group_id) REFERENCES permission_group (id) ON UPDATE CASCADE ON DELETE RESTRICT
    );
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP TABLE public.report;
  `);
};

exports._meta = {
  version: 1,
};
