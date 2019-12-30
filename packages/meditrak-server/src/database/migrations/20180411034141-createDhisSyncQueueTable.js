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
  return db.createTable('dhis_sync_queue', {
    columns: {
      id: { type: 'text', primaryKey: true },
      type: { type: 'text', notNull: true },
      record_type: { type: 'text', notNull: true },
      record_id: { type: 'text', notNull: true },
      details: { type: 'text' },
      change_time: { type: 'float', length: 17 },
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
