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
  /** As of comitting, this is expected to be a no-op */
  await db.runSql("DELETE FROM data_element WHERE service_type = 'superset';");
  await db.runSql("DELETE FROM data_element_data_service WHERE service_type = 'superset';");
  /** As of comitting, this is expected to be a no-op */
  await db.runSql("DELETE FROM data_group WHERE service_type = 'superset';");
};

/** Irreversible: deleted mappings are not reconstructed. */
exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
