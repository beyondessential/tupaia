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
  await db.runSql(`ALTER TABLE data_table ALTER COLUMN type SET NOT NULL;`);
  await db.runSql(`ALTER TABLE data_table ALTER COLUMN permission_groups DROP DEFAULT;`);
};

exports.down = async function (db) {
  await db.runSql(`ALTER TABLE data_table ALTER COLUMN type DROP NOT NULL;`);
  await db.runSql(`ALTER TABLE data_table ALTER COLUMN permission_groups SET DEFAULT '{}';`);
};

exports._meta = {
  version: 1,
};
