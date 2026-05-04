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
 * PostgreSQL 14 updated `array_cat()` to take `anycompatiblearray` (previously `anyarray`).
 * @see https://www.postgresql.org/docs/release/14.0
 *
 * @privateRemarks `array_concat_agg` was added in
 * 20220622064208-AddArrayConcatAggregationFunction-modifies-schema.js
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

/**
 * This migration was added when we upgraded Tupaia’s RDS engine from 13 to 18.  Attempting to
 * recreate it with `anyarray` will fail in modern PostgreSQL versions.
 * @see https://www.postgresql.org/docs/release/14.0
 */
exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  /* `array_concat_agg()` is used only by `createPermissionsBasedMeditrakSyncQueue` */
  targets: ['server'],
};
