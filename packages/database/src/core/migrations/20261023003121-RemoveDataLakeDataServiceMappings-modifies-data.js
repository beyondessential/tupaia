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
 * Using `strpos` rather than `LIKE`, because `_` is a `LIKE` wildcard.
 */
exports.up = async function (db) {
  await db.runSql(`
    CREATE TEMPORARY TABLE data_lake_code AS
      SELECT code FROM data_element WHERE service_type = 'data-lake'
      UNION
      SELECT code FROM data_group WHERE service_type = 'data-lake';

    DELETE FROM report r
    WHERE EXISTS (
      SELECT 1
      FROM data_lake_code dlc
      WHERE strpos(r.config::text, '"' || dlc.code || '"') > 0
    );
    DELETE FROM indicator i
    WHERE EXISTS (
      SELECT 1
      FROM data_lake_code dlc
      WHERE strpos(i.config::text, '"' || dlc.code || '"') > 0
        OR dlc.code = ANY (regexp_split_to_array(i.config ->> 'formula', '[^A-Za-z0-9_$@]+'))
    );

    DROP TABLE data_lake_code;

    DELETE FROM data_element_data_service
    WHERE service_type = 'data-lake'
      OR data_element_code IN (SELECT code FROM data_element WHERE service_type = 'data-lake');
    DELETE FROM data_element WHERE service_type = 'data-lake';
    DELETE FROM data_group WHERE service_type = 'data-lake';
  `);
};

/** Irreversible: deleted mappings are not reconstructed. */
exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
