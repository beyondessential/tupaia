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
  // Delete user_country_permission change record for now deleted user_country_permission.
  return db.runSql(
    `DELETE FROM meditrak_sync_queue WHERE record_type = 'user_country_permission' AND meditrak_sync_queue.record_id NOT IN (SELECT id from user_country_permission)`,
  );
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
