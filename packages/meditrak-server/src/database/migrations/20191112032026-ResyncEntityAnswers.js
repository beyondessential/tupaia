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

const selectAnswersConnectedToEntities = `
  SELECT
    id
  FROM
    answer
  WHERE
    type = 'Entity'
`;

const selectSurveyResponsesConnectedToEntities = `
  SELECT
    survey_response_id
  FROM
    answer
  WHERE
    type = 'Entity'
`;

exports.up = function(db) {
  return db.runSql(`
    UPDATE
      dhis_sync_queue
    SET
      priority = 1, is_deleted = FALSE
    WHERE
      record_id IN (${selectSurveyResponsesConnectedToEntities}) -- resync all survey responses with an entity answer
    OR
      record_id IN (${selectAnswersConnectedToEntities}); -- resync all answers to entity questions
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
