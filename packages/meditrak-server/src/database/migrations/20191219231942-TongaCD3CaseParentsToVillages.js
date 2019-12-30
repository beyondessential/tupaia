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

exports.up = async function(db) {
  const caseQuestionId = `(SELECT id FROM question WHERE code = 'CD3a_007')`;
  const villageQuestionId = `(SELECT id FROM question WHERE code = 'CD3a_004')`;

  await db.runSql(`
    UPDATE
      entity
    SET
      parent_id = village_answer.text
    FROM
      answer as case_code_answer
    JOIN
      answer as village_answer
    ON
      village_answer.survey_response_id = case_code_answer.survey_response_id
    WHERE
      entity.type = 'case' AND entity.country_code = 'TO' AND entity.code LIKE 'CD3-%' AND
      case_code_answer.text = entity.code AND case_code_answer.question_id = ${caseQuestionId} AND
      village_answer.question_id = ${villageQuestionId};
  `);
  return null;
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
