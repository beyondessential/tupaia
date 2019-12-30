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

exports.up = function(db) {
  return db.runSql(`
    UPDATE dhis_sync_queue
      SET type = 'delete', priority = 1, is_deleted = false
      WHERE id IN (
        SELECT dhis_sync_queue.id
          FROM dhis_sync_queue
          LEFT JOIN answer
            ON dhis_sync_queue.record_id = answer.id
          WHERE record_type = 'answer'
            AND dhis_sync_queue.type = 'update'
            AND answer.id IS NULL);
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
