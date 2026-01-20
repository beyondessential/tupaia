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
    CREATE TABLE external_database_connection (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      permission_groups TEXT[] NOT NULL DEFAULT '{}'
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE external_database_connection`);
};

exports._meta = {
  version: 1,
};
