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
    UPDATE project SET permission_groups = '{}' WHERE permission_groups IS NULL;
    ALTER TABLE project ALTER COLUMN permission_groups SET DEFAULT '{}';
    ALTER TABLE project ALTER COLUMN permission_groups SET NOT NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    ALTER TABLE project ALTER COLUMN permission_groups DROP DEFAULT;
    ALTER TABLE project ALTER COLUMN permission_groups DROP NOT NULL;
  `);
};

exports._meta = {
  version: 1,
};
