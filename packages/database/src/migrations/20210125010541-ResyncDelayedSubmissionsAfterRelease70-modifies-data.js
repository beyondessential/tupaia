'use strict';

import { DatabaseChangeChannel } from '../DatabaseChangeChannel';
import { arrayToDbString, markRecordsForResync } from '../utilities';

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

/**
 * This migration attempts to resync survey responses and answers
 * that were not added in the DHIS queue because of a bug.
 *
 * The bug was in place between 2021-01-14T22:36Z and 2021-01-21T04.35Z.
 * A previous migration "20210120051444-ResyncSubmissionsAfterRelease70"
 * resynced responses that were completed in the app during  that period.
 * This migration resyncs earlier submissions by users who attempted to sync during that period.
 *
 * @see https://github.com/beyondessential/tupaia-backlog/issues/2160
 */

const MIN_REQUEST_TIME = '2021-01-14';
const MAX_REQUEST_TIME = '2021-01-22';

const selectEventBasedSurveys = async db => {
  const { rows } = await db.runSql(`
    SELECT s.code from survey s
    JOIN survey_screen ss on ss.survey_id = s.id
    JOIN survey_screen_component ssc on ssc.screen_id = ss.id
    JOIN question q on q.id = ssc.question_id
    WHERE
      q.type = 'PrimaryEntity' AND
      can_repeat is FALSE or ssc.config::text like '%case%'`);

  return rows;
};

const createSelectResponseStatement = columns => `
  SELECT sr.${columns} FROM survey_response sr
  JOIN survey s ON sr.survey_id = s.id
  JOIN data_source ds ON ds.id = s.data_source_id
  LEFT JOIN dhis_sync_queue dsq ON sr.id = record_id
  WHERE
    dsq.id IS NULL AND
    ds.service_type = 'dhis' AND
    sr.user_id IN (
      SELECT distinct user_id FROM api_request_log
      WHERE
        endpoint = '/changes/count' AND
        request_time BETWEEN '${MIN_REQUEST_TIME}' AND '${MAX_REQUEST_TIME}'
      )`;

const selectSurveyResponsesForResync = async db => {
  const query = createSelectResponseStatement('*');
  const { rows } = await db.runSql(query);
  return rows;
};

const selectAnswersForResync = async db => {
  const eventSurveys = await selectEventBasedSurveys(db);
  const eventSurveyCodes = eventSurveys.map(s => s.code);

  const { rows } = await db.runSql(`
    SELECT a.* FROM answer a
    JOIN survey_response sr on sr.id = a.survey_response_id
    JOIN survey s on s.id = sr.survey_id
    WHERE
      a.survey_response_id IN (${createSelectResponseStatement('id')}) AND
      s.code NOT IN (${arrayToDbString(eventSurveyCodes)})`);

  return rows;
};

const updateSyncQueueForSurveyResponses = async (db, surveyResponseIds) =>
  db.runSql(`
    UPDATE dhis_sync_queue dsq
    SET is_deleted = false, priority = 2 -- use priority 2 not to block up new data syncing through
    WHERE
      record_type = 'survey_response' AND
      type = 'update' AND
      record_id IN (${arrayToDbString(surveyResponseIds)})`);

const updateSyncQueueForAnswers = async (db, answerIds) => {
  const batchSize = 500;

  for (let i = 0; i < answerIds.length; i += batchSize) {
    await db.runSql(`
      UPDATE dhis_sync_queue dsq
      SET is_deleted = false, priority = 2 -- use priority 2 not to block up new data syncing through
      WHERE
        record_type = 'answer' AND
        type = 'update' AND
        record_id IN (${arrayToDbString(answerIds.slice(i, i + batchSize))})`);
  }
};

exports.up = async function (db) {
  const changeChannel = new DatabaseChangeChannel();

  try {
    //
    // Publish changes for every survey response and answer that
    // * isn't already in the sync queue,
    // * its user attempted to push changes using the app while the app was in place
    // n.b. this requires a meditrak-server instance to be running and listening for the changes
    const surveyResponses = await selectSurveyResponsesForResync(db);
    await markRecordsForResync(changeChannel, 'survey_response', surveyResponses);
    const answers = await selectAnswersForResync(db);
    await markRecordsForResync(changeChannel, 'answer', answers);

    await updateSyncQueueForSurveyResponses(
      db,
      surveyResponses.map(sr => sr.id),
    );
    await updateSyncQueueForAnswers(
      db,
      answers.map(a => a.id),
    );
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
