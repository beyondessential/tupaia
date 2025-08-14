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

exports.up = function (db) {
  return db.runSql(`
    ALTER TABLE data_source ALTER COLUMN service_type TYPE VARCHAR(255);
    ALTER TABLE data_service_sync_group ALTER COLUMN service_type TYPE VARCHAR(255);
    ALTER TABLE sync_service ALTER COLUMN service_type TYPE VARCHAR(255);
    ALTER TABLE sync_service_log ALTER COLUMN service_type TYPE VARCHAR(255);
    DROP TYPE IF EXISTS service_type;
    CREATE TYPE service_type AS ENUM (
        'dhis',
        'tupaia',
        'indicator',
        'weather',
        'kobo',
        'data-lake'
    );
    ALTER TABLE data_source ALTER COLUMN service_type TYPE service_type USING (service_type::service_type);
    ALTER TABLE data_service_sync_group ALTER COLUMN service_type TYPE service_type USING (service_type::service_type);
    ALTER TABLE sync_service ALTER COLUMN service_type TYPE service_type USING (service_type::service_type);
    ALTER TABLE sync_service_log ALTER COLUMN service_type TYPE service_type USING (service_type::service_type);
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
