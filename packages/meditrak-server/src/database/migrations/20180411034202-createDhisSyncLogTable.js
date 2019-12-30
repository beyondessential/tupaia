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
  return db.createTable('dhis_sync_log', {
    columns: {
      id: { type: 'text', primaryKey: true },
      record_id: { type: 'text', notNull: true },
      record_type: { type: 'text', notNull: true },
      dhis_references: { type: 'text' },
      imported: { type: 'float', length: 17, defaultValue: 0 },
      updated: { type: 'float', length: 17, defaultValue: 0 },
      deleted: { type: 'float', length: 17, defaultValue: 0 },
      ignored: { type: 'float', length: 17, defaultValue: 0 },
      error_list: { type: 'text' },
      data: { type: 'text' },
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
