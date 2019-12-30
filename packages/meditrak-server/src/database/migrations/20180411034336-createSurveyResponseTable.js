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
  return db.createTable('survey_response', {
    columns: {
      id: { type: 'text', primaryKey: true },
      survey_id: { type: 'text', notNull: true },
      user_id: { type: 'text', notNull: true },
      accessor_name: { type: 'text', notNull: true },
      clinic_id: { type: 'text', notNull: true },
      start_time: { type: 'timestamp', notNull: true },
      end_time: { type: 'timestamp', notNull: true },
      metadata: { type: 'text' },
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
