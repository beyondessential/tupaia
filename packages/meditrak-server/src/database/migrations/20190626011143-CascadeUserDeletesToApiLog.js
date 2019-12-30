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
    ALTER TABLE api_request_log
      DROP CONSTRAINT api_request_log_user_id_fkey;
    ALTER TABLE api_request_log
      ADD CONSTRAINT api_request_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_account(id) ON UPDATE CASCADE ON DELETE CASCADE;
  `);
};

exports.down = function(db) {
  return db.runSql(`
    ALTER TABLE api_request_log
      DROP CONSTRAINT api_request_log_user_id_fkey;
    ALTER TABLE api_request_log
      ADD CONSTRAINT api_request_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_account(id) ON UPDATE CASCADE;
  `);
};

exports._meta = {
  version: 1,
};
