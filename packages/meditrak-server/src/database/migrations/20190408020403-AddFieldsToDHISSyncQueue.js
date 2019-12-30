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

exports.up = async function(db) {
  await db.runSql(`
    ALTER TABLE dhis_sync_queue
      ADD COLUMN is_dead_letter boolean DEFAULT false,
      ADD COLUMN bad_request_count integer DEFAULT 1,
      ADD COLUMN is_deleted boolean DEFAULT false;
  `);
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
