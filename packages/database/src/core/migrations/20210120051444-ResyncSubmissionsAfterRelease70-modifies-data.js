'use strict';

import { DatabaseChangeChannel } from '../../server/DatabaseChangeChannel';
import { markRecordsForResync } from '../utilities';

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

const MIN_SURVEY_END_TIME = '2021-01-14';

const selectSurveyResponsesForResync = async db => {
  const { rows } = await db.runSql(`
    SELECT survey_response.*
    FROM survey_response
    JOIN survey ON survey_response.survey_id = survey.id
    LEFT JOIN dhis_sync_queue ON survey_response.id = record_id
    WHERE
      dhis_sync_queue.id IS NULL AND
      survey_response.end_time > '${MIN_SURVEY_END_TIME}'`);
  return rows;
};

const selectAnswersForResync = async db => {
  const { rows } = await db.runSql(`
    SELECT answer.*
    FROM answer
    JOIN survey_response ON answer.survey_response_id = survey_response.id
    JOIN survey ON survey_response.survey_id = survey.id
    LEFT JOIN dhis_sync_queue ON answer.id = record_id
    WHERE
      survey_response.end_time > '${MIN_SURVEY_END_TIME}' AND
      survey.can_repeat = false AND -- repeating surveys are event based, don't need answers in sync queue
      survey.code NOT IN ('CD3a', 'CD3b') AND -- non org unit entity surveys, event based
      dhis_sync_queue.id IS NULL`);
  return rows;
};

const updateSyncQueueForSurveyResponses = async db =>
  db.runSql(`
    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 2 -- use priority 2 not to block up new data syncing through
    FROM survey_response, survey
    WHERE
      record_type = 'survey_response' AND
      dhis_sync_queue.type = 'update' AND
      dhis_sync_queue.record_id = survey_response.id AND
      survey_response.survey_id = survey.id AND
      survey_response.end_time > '${MIN_SURVEY_END_TIME}'`);

const updateSyncQueueForAnswers = async db =>
  db.runSql(`
    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 2 -- use priority 2 not to block up new data syncing through
    FROM answer, survey_response, survey
    WHERE
      record_type = 'answer' AND
      dhis_sync_queue.type = 'update' AND
      dhis_sync_queue.record_id = answer.id AND
      answer.survey_response_id = survey_response.id AND
      survey_response.survey_id = survey.id AND
      survey_response.end_time > '${MIN_SURVEY_END_TIME}'`);

exports.up = async function (db) {
  const changeChannel = new DatabaseChangeChannel();

  try {
    // publish changes for every survey response and answer that isn't already in
    // the sync queue since Release 70
    // n.b. this requires a central-server instance to be running and listening for the changes
    const surveyResponses = await selectSurveyResponsesForResync(db);
    await markRecordsForResync(changeChannel, 'survey_response', surveyResponses);
    const answers = await selectAnswersForResync(db);
    await markRecordsForResync(changeChannel, 'answer', answers);

    await updateSyncQueueForSurveyResponses(db);
    await updateSyncQueueForAnswers(db);
  } finally {
    changeChannel.close();
  }
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
