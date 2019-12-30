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
    UPDATE
      dhis_sync_log
    SET
      deleted = 0
    FROM
      dhis_sync_queue
    WHERE
      dhis_sync_log.record_id = dhis_sync_queue.record_id
    AND
      imported = 1 AND deleted = 1
    AND
      dhis_sync_queue.type = 'update';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
