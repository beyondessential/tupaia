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
      WHERE record_type = 'survey_response'
        AND type = 'update'
        AND record_id NOT IN (SELECT id FROM survey_response);
  `);
};

exports.down = function(db) {
  // no way to reverse out
  return null;
};

exports._meta = {
  version: 1,
};
