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
  await db.runSql("DELETE FROM sync_group_log WHERE service_type = 'kobo';");
  await db.runSql("DELETE FROM data_service_sync_group WHERE service_type = 'kobo';");

  /** As of comitting, these are expected to be no-ops */
  await db.runSql("DELETE FROM data_element WHERE service_type = 'kobo';");
  await db.runSql("DELETE FROM data_element_data_service WHERE service_type = 'kobo';");
  await db.runSql("DELETE FROM data_group WHERE service_type = 'kobo';");

  /** Drop mappings that only held a `kobo_id`, and strip it from any others */
  await db.runSql(`
    DELETE FROM data_service_entity
    WHERE config -> 'kobo_id' IS NOT NULL AND config - 'kobo_id' = '{}'::jsonb;
  `);
  await db.runSql(`
    UPDATE data_service_entity
    SET config = config - 'kobo_id'
    WHERE config -> 'kobo_id' IS NOT NULL;
  `);
};

/** Irreversible: deleted sync groups, logs and mappings are not reconstructed. */
exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
  targets: ['server'],
};
