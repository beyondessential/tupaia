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
  return db.createTable('survey_screen_component', {
    columns: {
      id: { type: 'text', primaryKey: true },
      question_id: { type: 'text', notNull: true },
      screen_id: { type: 'text', notNull: true },
      component_number: { type: 'float', length: 17, notNull: true },
      answers_enabling_follow_up: { type: 'text' },
      is_follow_up: { type: 'boolean', defaultValue: false },
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
