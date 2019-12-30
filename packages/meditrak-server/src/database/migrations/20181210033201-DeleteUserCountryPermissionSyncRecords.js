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
    DELETE FROM meditrak_sync_queue WHERE record_type = 'user_country_permission' OR record_type = 'user_account';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
