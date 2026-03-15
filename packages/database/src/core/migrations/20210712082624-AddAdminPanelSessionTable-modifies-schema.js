'use strict';

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable('admin_panel_session', {
    columns: {
      id: { type: 'text', primaryKey: true },
      email: { type: 'text', notNull: true },
      access_policy: { type: 'jsonb', notNull: true },
      access_token: { type: 'text', notNull: true },
      access_token_expiry: { type: 'bigint', notNull: true },
      refresh_token: { type: 'text', notNull: true },
    },
    ifNotExists: true,
  });
};

exports.down = function (db) {
  return db.dropTable('admin_panel_session');
};

exports._meta = {
  version: 1,
};
