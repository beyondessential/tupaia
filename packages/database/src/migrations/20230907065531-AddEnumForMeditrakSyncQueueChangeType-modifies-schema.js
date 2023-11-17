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
    DROP MATERIALIZED VIEW IF EXISTS permissions_based_meditrak_sync_queue;
    CREATE TYPE meditrak_sync_queue_change_type AS ENUM ('update', 'delete');
    ALTER TABLE meditrak_sync_queue ALTER COLUMN type TYPE meditrak_sync_queue_change_type USING type::meditrak_sync_queue_change_type;
    ALTER TABLE meditrak_sync_queue ALTER COLUMN change_time SET NOT NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
    DROP MATERIALIZED VIEW IF EXISTS permissions_based_meditrak_sync_queue;
    ALTER TABLE meditrak_sync_queue ALTER COLUMN change_time DROP NOT NULL;
    ALTER TABLE meditrak_sync_queue ALTER COLUMN type TYPE TEXT;
    DROP TYPE IF EXISTS meditrak_sync_queue_change_type;
`);
};

exports._meta = {
  version: 1,
};
