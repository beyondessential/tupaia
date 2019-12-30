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
  // Prepopulates a coconut for every past survey response a user has provided.
  return db.runSql(`
  INSERT INTO user_reward (id,user_id,coconuts,model_name,model_id,creation_date)
  SELECT id, user_id, 1, 'SurveyResponse', id, end_time
  FROM survey_response
  WHERE user_id IS NOT NULL
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
