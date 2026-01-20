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
  return db.createTable('indicator', {
    columns: {
      id: { type: 'text', primaryKey: true },
      code: { type: 'text', notNull: true, unique: true },
      builder: { type: 'text', notNull: true },
      config: { type: 'jsonb', notNull: true, defaultValue: '{}' },
    },
  });
};

exports.down = function (db) {
  return db.dropTable('indicator');
};

exports._meta = {
  version: 1,
};
