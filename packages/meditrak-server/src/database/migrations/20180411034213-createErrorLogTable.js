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
  return db.createTable('error_log', {
    columns: {
      id: { type: 'text', primaryKey: true },
      message: { type: 'text' },
      api_request_log_id: { type: 'text' },
      type: { type: 'text' },
      error_time: { type: 'timestamp', defaultVaue: new String('now()') },
    },
    ifNotExists: true,
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
