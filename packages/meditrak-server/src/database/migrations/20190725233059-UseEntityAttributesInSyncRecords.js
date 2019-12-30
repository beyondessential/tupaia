'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const OLD_ENTITY_TABLES = ['clinic', 'country', 'geographical_area'];

const updateEntityAttrs = async (db, table, column) =>
  db.runSql(`
  UPDATE
    "${table}"
  SET
    "record_type" = 'entity',
    "record_id" = entity.id
  FROM
    entity
  WHERE
    "record_type" IN (${OLD_ENTITY_TABLES.map(oldTable => `'${oldTable}'`).join(', ')}) AND
    entity.code = "${table}"."${column}"::json->>'code';
`);

exports.up = async function(db) {
  await updateEntityAttrs(db, 'dhis_sync_log', 'data');
  return updateEntityAttrs(db, 'dhis_sync_queue', 'details');
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
