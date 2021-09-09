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
  return db.createTable('data_service_entity', {
    columns: {
      id: { type: 'text', primaryKey: true },
      entity_code: { type: 'text', notNull: true, unique: true },
      config: { type: 'jsonb', notNull: true, default: '{}' },
    },
  });
};

exports.down = function (db) {
  return db.dropTable('data_service_entity');
};

exports._meta = {
  version: 1,
};
