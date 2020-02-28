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
  return db.runSql(`
    UPDATE survey_response
    SET entity_id = entity.id
    FROM entity
    JOIN answer ON entity.name = answer.text
    JOIN question ON answer.question_id = question.id
    WHERE survey_response.id = answer.survey_response_id
    AND question.type = 'PrimaryEntity';

    DELETE FROM answer
    USING question
    WHERE answer.question_id = question.id
    AND question.type = 'PrimaryEntity';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
