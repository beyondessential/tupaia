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

/**
 * @privateRemarks
 * PostgreSQL 14 updated `array_cat()` to take `anycompatiblearray` (previously `anyarray`).
 * When we upgraded Tupaia’s RDS engine from v13 to v18, this migration was edited to also take
 * `anycompatiblearray` so this migration doesn’t error.
 * @see https://www.postgresql.org/docs/release/14.0
 */
exports.up = async function (db) {
  await db.runSql('DROP AGGREGATE IF EXISTS array_concat_agg(anyarray);');
  await db.runSql(`
    CREATE OR REPLACE AGGREGATE array_concat_agg(anycompatiblearray) (
      SFUNC = array_cat,
      STYPE = anycompatiblearray
    );
  `);
};

exports.down = async function (db) {
  await db.runSql('DROP AGGREGATE IF EXISTS array_concat_agg(anycompatiblearray);');
};

exports._meta = {
  version: 1,
};
