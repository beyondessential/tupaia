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
    ALTER TABLE dashboard_item DROP COLUMN permission_group_ids;
    ALTER TABLE report DROP COLUMN permission_group_id CASCADE;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE dashboard_item ADD COLUMN permission_group_ids TEXT[] NOT NULL DEFAULT '{}';
    ALTER TABLE report ADD COLUMN permission_group_id TEXT NOT NULL;
    ALTER TABLE report ADD CONSTRAINT FOREIGN KEY (permission_group_id) REFERENCES permission_group (id) ON UPDATE CASCADE ON DELETE RESTRICT;
  `);
};

exports._meta = {
  version: 1,
};
