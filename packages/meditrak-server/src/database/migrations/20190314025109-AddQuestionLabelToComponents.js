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
  db.addColumn('survey_screen_component', 'question_label', { type: 'text' });
  return db.addColumn('survey_screen_component', 'detail_label', { type: 'text' });
};

exports.down = function(db) {
  db.removeColumn('survey_screen_component', 'question_label');
  return db.removeColumn('survey_screen_component', 'detail_label');
};

exports._meta = {
  version: 1,
};
