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
  return db.runSql(`CREATE TABLE ms1_sync_log (
      id text NOT NULL,
      record_type text NOT NULL,
      record_id text NOT NULL,
      count integer DEFAULT 1,
      error_list text,
      endpoint text,
      data text
    );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
