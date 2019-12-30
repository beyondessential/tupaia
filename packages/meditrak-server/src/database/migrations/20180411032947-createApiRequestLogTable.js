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
  return db.createTable('api_request_log', {
    columns: {
      id: { type: 'text', primaryKey: true },
      version: { type: 'float', length: 17, notNull: true },
      endpoint: { type: 'text', notNull: true },
      user_id: { type: 'text' },
      request_time: { type: 'timestamp' },
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
