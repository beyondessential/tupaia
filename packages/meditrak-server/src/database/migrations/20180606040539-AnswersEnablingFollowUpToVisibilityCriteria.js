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
  // Takes the info that used to be represented by 'answers_enabling_follow_up' and 'is_follow_up',
  // and converts and stores it in the new 'visibility_criteria' column
  return db.runSql(`
    UPDATE survey_screen_component
    SET visibility_criteria = '{ "' || subquery.question_id || '": ["' || array_to_string(subquery.answers_enabling_follow_up, '","') || '"] }'
    FROM (
      SELECT follow_up_components.id AS survey_screen_component_id, initiating_component.* FROM survey_screen_component AS follow_up_components
      JOIN (
        SELECT answers_enabling_follow_up, screen_id, question.id AS question_id FROM survey_screen_component
        JOIN question ON survey_screen_component.question_id = question.id
        WHERE array_length(answers_enabling_follow_up, 1) > 0
      ) AS initiating_component ON follow_up_components.screen_id = initiating_component.screen_id
      WHERE follow_up_components.is_follow_up = true
    ) as subquery
    WHERE survey_screen_component.id = subquery.survey_screen_component_id;
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
