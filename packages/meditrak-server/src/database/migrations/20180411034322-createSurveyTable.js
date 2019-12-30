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
  return db.createTable('survey', {
    columns: {
      id: { type: 'text', primaryKey: true },
      name: { type: 'text', notNull: true },
      code: { type: 'text', notNull: true },
      image_data: { type: 'text' },
      permission_group_id: { type: 'text' },
      country_ids: { type: 'text' },
      can_repeat: { type: 'boolean', defaultValue: false },
      survey_group_id: { type: 'text' },
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
