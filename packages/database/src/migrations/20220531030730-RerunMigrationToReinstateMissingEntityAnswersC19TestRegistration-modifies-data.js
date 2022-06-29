'use strict';

import { codeToId } from '../utilities';

// Note: This migration is just a copy of the below migration in order to rerun it for new data;
// 20220513032539-ReinstateMissingEntityAnswersC19TestRegistration-modifies-data.js;

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const SURVEY_CODE = 'C19T_Registration';
const QUESTION_CODE = 'C19T007';

exports.up = async function (db) {
  // the missing entity answers have been stored as the parent of the primary entity of each
  // response, copy the id from there into a new answer
  const surveyId = await codeToId(db, 'survey', SURVEY_CODE);
  const questionId = await codeToId(db, 'question', QUESTION_CODE);
  await db.runSql(`
    INSERT INTO answer (id, survey_response_id, question_id, type, text)
    SELECT
      generate_object_id(), survey_response.id, '${questionId}', 'Entity', entity.parent_id
    FROM
      survey_response
    JOIN
      entity
    ON
      survey_response.entity_id = entity.id
    LEFT JOIN
      answer
    ON
      answer.survey_response_id = survey_response.id and answer.question_id = '${questionId}'
    WHERE
      survey_id = '${surveyId}'
    AND
      answer.id is null;
  `);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
