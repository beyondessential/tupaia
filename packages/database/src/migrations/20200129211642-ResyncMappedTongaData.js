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
  const eventBasedSurveysWithRemappedQuestions = `
    SELECT id
    FROM survey
    WHERE code IN ('CD2','CD3a','CD3b','CD4','CD1','CD8')
  `;

  const surveyResponseIds = `
    SELECT id
    FROM survey_response
    WHERE survey_id IN (${eventBasedSurveysWithRemappedQuestions})
  `;

  const dataSourcesWithCategoryCombos = `
    SELECT code
    FROM data_source
    WHERE config ? 'categoryComboCode'
  `;

  const remappedAggregateQuestions = `
    SELECT id
    FROM question
    WHERE code IN (${dataSourcesWithCategoryCombos})
  `;

  const answerIds = `
    SELECT id
    FROM answer
    WHERE question_id IN (${remappedAggregateQuestions})
  `;

  return db.runSql(`
    -- update survey responses and answers separately as too many at once causes duplicate change times
    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 1
    WHERE record_id IN (${surveyResponseIds});

    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 1
    WHERE record_id IN (${answerIds});
  `);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
