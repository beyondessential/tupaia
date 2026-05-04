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
    CREATE OR REPLACE AGGREGATE array_concat_agg(anyarray) (
      SFUNC = array_cat,
      STYPE = anyarray
    );
  `);
};

exports.down = async function (db) {
  await db.runSql('DROP AGGREGATE IF EXISTS array_concat_agg(anyarray);');
};

exports._meta = {
  version: 1,
  /* `array_concat_agg()` is used only by `createPermissionsBasedMeditrakSyncQueue` */
  targets: ['server'],
};
