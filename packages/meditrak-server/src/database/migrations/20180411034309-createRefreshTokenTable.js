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
  return db.createTable('refresh_token', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: { type: 'text', notNull: true },
      device: { type: 'text' },
      token: { type: 'text', notNull: true },
      expiry: { type: 'float', length: 17 },
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
