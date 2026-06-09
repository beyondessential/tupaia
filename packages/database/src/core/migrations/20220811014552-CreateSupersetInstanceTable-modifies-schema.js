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
    CREATE TABLE superset_instance (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL UNIQUE,
      config JSONB NOT NULL
    )
  `);

  await db.runSql(`ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'superset';`);
};

exports.down = async function (db) {
  await db.runSql(`DROP TABLE superset_instance`);
};

exports._meta = {
  version: 1,
};
