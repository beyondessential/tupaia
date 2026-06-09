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
    ALTER TABLE user_account
    ADD COLUMN project_id TEXT,
    ADD FOREIGN KEY (project_id) REFERENCES project(id);
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE user_account DROP COLUMN project_id;
  `);
};

exports._meta = {
  version: 1,
};
