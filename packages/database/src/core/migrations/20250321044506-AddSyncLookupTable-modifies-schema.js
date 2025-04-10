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
    CREATE TABLE sync_lookup
    (
      id                      BIGSERIAL PRIMARY KEY,
      record_id               VARCHAR(255) NOT NULL,
      record_type             VARCHAR(255) NOT NULL,
      data                    JSON         NOT NULL,
      updated_at_sync_tick    BIGINT       NOT NULL,
      project_ids             VARCHAR(255)[],
      pushed_by_device_id     VARCHAR(255),
      CONSTRAINT sync_lookup_record_id_record_type_unique UNIQUE (record_id, record_type)
    );

    CREATE INDEX sync_lookup_updated_at_sync_tick_project_ids_index
    ON sync_lookup (updated_at_sync_tick, project_ids);
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
