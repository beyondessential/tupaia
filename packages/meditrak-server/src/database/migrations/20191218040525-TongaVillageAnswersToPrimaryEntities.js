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

const TONGA_VILLAGE_QUESTION_CODES = [
  'CD6',
  'CD2_3',
  'CD3a_004',
  'CD3b_005',
  'CD4_004',
  'CD93',
  'CH286',
  'CH451',
  'HP2',
  'HP29',
  'HP238',
  'HP279',
];
const questionIdsSql = `
  answer.question_id IN (
    SELECT
      id
    FROM
      question
    WHERE
      type = 'PrimaryEntity'
    AND
      code IN (${TONGA_VILLAGE_QUESTION_CODES.map(c => `'${c}'`).join(',')})
  )`;

const TONGA_VILLAGE_SURVEY_CODES = [
  'CD1',
  'CD2',
  'CD3a',
  'CD3b',
  'CD4',
  'CD8',
  'CH4',
  'CH11',
  'HP01',
  'HP02',
  'HP05',
  'HP07',
];
const surveyIdsSql = `
  survey_id IN (
    SELECT
      id
    FROM
      survey
    WHERE
      code IN (${TONGA_VILLAGE_SURVEY_CODES.map(c => `'${c}'`).join(',')})
  )`;

exports.up = async function(db) {
  await db.runSql(`
    UPDATE
      survey_response
    SET
      entity_id = answer.text
    FROM
      answer
    WHERE
      answer.survey_response_id = survey_response.id
    AND
      ${questionIdsSql};
  `);
  return null;
};

exports.down = async function(db) {
  await db.runSql(`
    UPDATE
      survey_response
    SET
      entity_id = entity.parent_id
    FROM
      entity
    WHERE
      entity.id = survey_response.entity_id
    AND
      ${surveyIdsSql}
  `);
  return null;
};

exports._meta = {
  version: 1,
};
