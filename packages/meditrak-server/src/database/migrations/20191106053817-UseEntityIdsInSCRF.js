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
  const BaroId = `(SELECT id FROM entity WHERE name = 'Baro' )`;
  const oldFacilityQuestionId = `(SELECT id FROM question WHERE code = 'STR_CRF197')`;
  const newFacilityQuestionId = `(SELECT id FROM question WHERE code = 'STR_CRF197_entity')`;
  const caseQuestionId = `(SELECT id FROM question WHERE code = 'STR_CRF167')`;
  const newVillageQuestionId = `(SELECT id FROM question WHERE code = 'STR_CRF_village_entity')`;

  // Update case and village questions in SCRF to use entity ids instead of names.
  // All survey responses for SCRF at the time of the migration where against Baro (PG)
  return db.runSql(`
    UPDATE
      answer
    SET
      text = (${BaroId}),
      type = 'Entity',
      question_id = ${newFacilityQuestionId}
    WHERE
      question_id = ${oldFacilityQuestionId};

    UPDATE
      answer
    SET
      text = entity.id,
      type = 'Entity',
      question_id = ${newVillageQuestionId}
    FROM
      entity, question
    WHERE
      answer.text = entity.name AND
      answer.question_id = question.id AND
      question.code LIKE 'STR_CRF%' AND
      question.indicator ILIKE '%Residence Ward/Village%';

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
      entity.type = 'case' AND entity.country_code = 'PG' AND entity.code LIKE 'AAX-%' AND
      case_code_answer.text = entity.code AND case_code_answer.question_id = ${caseQuestionId} AND
      village_answer.question_id = ${newVillageQuestionId};

    -- Update parent id for 'Other' villages
    UPDATE entity SET parent_id = '5dc35af961f76a1837c095d7' WHERE code IN ('AAX-EDE-MTA-D2S3', 'AAX-R5T-N7P-FOKO');

    UPDATE
      dhis_sync_queue
    SET
      priority = 1, is_deleted = FALSE
    WHERE
      record_id IN (
        SELECT record_id FROM dhis_sync_log WHERE data LIKE '%program":"SCRF"%'
      );
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
