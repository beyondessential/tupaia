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
  await db.runSql(`CREATE TYPE data_table_type AS ENUM('internal');`);
  await db.runSql(`
    CREATE TABLE data_table (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      description TEXT,
      type data_table_type NOT NULL,
      config JSONB NOT NULL DEFAULT '{}',
      permission_groups TEXT[] NOT NULL DEFAULT '{}' 
    )
  `);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE data_table`);
  await db.runSql(`DROP TYPE IF EXISTS data_table_type`);
};

exports._meta = {
  version: 1,
};
