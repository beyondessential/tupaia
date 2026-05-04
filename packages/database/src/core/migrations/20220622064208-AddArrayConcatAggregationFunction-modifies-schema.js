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
 * v14 updated `array_cat()` to take `anycompatiblearray` argument (previously `anyarray`)
 * @see https://www.postgresql.org/docs/release/14.0
 */
exports.up = async function (db) {
  return await db.runSql(`
    DO $do$
    BEGIN
      IF current_setting('server_version_num')::int < 140000 THEN
        EXECUTE $sql$
          CREATE OR REPLACE AGGREGATE array_concat_agg(anyarray) (
            SFUNC = array_cat,
            STYPE = anyarray
          );
        $sql$;
      ELSE
        EXECUTE $sql$
          CREATE OR REPLACE AGGREGATE array_concat_agg(anycompatiblearray) (
            SFUNC = array_cat,
            STYPE = anycompatiblearray
          );
        $sql$;
      END IF;
    END
    $do$;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP AGGREGATE IF EXISTS array_concat_agg(anyarray);
    DROP AGGREGATE IF EXISTS array_concat_agg(anycompatiblearray);
  `);
};

exports._meta = {
  version: 1,
};
