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
    -- delete all old sync log records as the data has been manually deleted from dhis2
    DELETE FROM dhis_sync_log
    USING survey_response, survey
    WHERE record_type = 'survey_response'
    AND record_id = survey_response.id
    AND survey_response.survey_id = survey.id
    AND survey.code IN ('CD2','CD3a','CD3b','CD4','CD1','CD8');

    DELETE FROM dhis_sync_log
    USING answer, question, data_source
    WHERE record_type = 'answer'
    AND record_id = answer.id
    AND answer.question_id = question.id
    AND question.code = data_source.code
    AND data_source.config ? 'categoryComboCode';

    -- update survey responses and answers separately as too many at once causes duplicate change times
    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 1
    FROM survey_response, survey
    WHERE record_type = 'survey_response'
    AND type = 'update'
    AND record_id = survey_response.id
    AND survey_response.survey_id = survey.id
    AND survey.code IN ('CD2','CD3a','CD3b','CD4','CD1','CD8');

    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 1
    FROM answer, question, data_source
    WHERE record_type = 'answer'
    AND dhis_sync_queue.type = 'update'
    AND record_id = answer.id
    AND answer.question_id = question.id
    AND question.code = data_source.code
    AND data_source.config ? 'categoryComboCode';
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
