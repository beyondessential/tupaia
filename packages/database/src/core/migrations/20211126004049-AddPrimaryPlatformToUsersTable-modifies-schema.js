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
      CREATE TYPE PRIMARY_PLATFORM AS ENUM('tupaia', 'lesmis');
      ALTER TABLE user_account ADD COLUMN primary_platform PRIMARY_PLATFORM DEFAULT 'tupaia';
  `);
};

exports.down = async function (db) {
  await db.runSql(`
      ALTER TABLE user_account DROP COLUMN primary_platform;
      DROP TYPE PRIMARY_PLATFORM
  `);
};

exports._meta = {
  version: 1,
};
