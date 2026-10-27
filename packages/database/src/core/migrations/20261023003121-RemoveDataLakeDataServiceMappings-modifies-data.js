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
    DELETE FROM report r
    WHERE EXISTS (
      SELECT 1
      FROM data_element de
      WHERE de.service_type = 'data-lake'
        AND strpos(r.config::text, '"' || de.code || '"') > 0
    );
    DELETE FROM indicator i
    WHERE EXISTS (
      SELECT 1
      FROM data_element de
      WHERE de.service_type = 'data-lake'
        AND strpos(i.config::text, '"' || de.code || '"') > 0
    );
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
