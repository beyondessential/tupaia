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
  return db.createTable('data_source', {
    columns: {
      id: { type: 'text', primaryKey: true },
      code: { type: 'text', notNull: true, unique: true },
      service: { type: 'text', notNull: true },
      config: { type: 'jsonb', notNull: true, default: '{}' },
    },
    ifNotExists: true,
  });
};

exports.down = function(db) {
  return db.dropTable('data_source');
};

exports._meta = {
  version: 1,
};
