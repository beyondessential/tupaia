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
  return db.createTable('user_country_permission', {
    columns: {
      id: { type: 'text', primaryKey: true },
      user_id: { type: 'text', notNull: true },
      country_id: { type: 'text', notNull: true },
      permission_group_id: { type: 'text', notNull: true },
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
