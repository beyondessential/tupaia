'use strict';

import path from 'path';

import { DatabaseChangeChannel } from '../../server/DatabaseChangeChannel';
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
 * that were not added in the DHIS queue because of:
 *
 * 1. Bug #2160 that was in place between 2021-01-14T22:36Z - 2021-01-21T04.35Z
 * 2. A server malfunction that blocked syncing between 2020-12-20 - 2020-12-22
 *
 * Here, we resync unsynced submissions by users who attempted to sync in the above periods
 *
 * @see https://github.com/beyondessential/tupaia-backlog/issues/885#issuecomment-767197853
 * @see https://github.com/beyondessential/tupaia-backlog/issues/2143
 * @see https://github.com/beyondessential/tupaia-backlog/issues/2160
 */

const DATE_RANGES = [
  ['2020-12-20', '2020-12-23'],
  ['2021-01-14', '2021-01-22'],
];

const selectEventBasedSurveys = async db => {
  const { rows } = await db.runSql(`
    SELECT distinct s.code from survey s
    JOIN survey_screen ss on ss.survey_id = s.id
    JOIN survey_screen_component ssc on ssc.screen_id = ss.id
    JOIN question q on q.id = ssc.question_id
    WHERE
      can_repeat is TRUE OR
      (q.type = 'PrimaryEntity' AND (ssc.config::text like '%case%' or ssc.config::text like '%catchment%'))`);

  return rows;
};

const createSelectResponseStatement = columns => {
  const requestTimeCondition = DATE_RANGES.map(
    ([start, end]) => `request_time BETWEEN '${start}' AND '${end}'`,
  ).join(' OR ');

  return `
    SELECT sr.${columns} FROM survey_response sr
    JOIN survey s ON sr.survey_id = s.id
    JOIN data_source ds ON ds.id = s.data_source_id
    JOIN entity e on e.id = sr.entity_id
    LEFT JOIN dhis_sync_queue dsq ON sr.id = record_id
    WHERE
    dsq.id IS NULL AND
    ds.service_type = 'dhis' AND
    sr.user_id IN (
      SELECT distinct user_id FROM api_request_log
        WHERE endpoint = '/changes/count' AND (${requestTimeCondition})
      ) AND
      -- before this date, sync records were deleted once successful
      sr.end_time > '2019-04-15' AND
      -- Demo Land responses aren't synced (unless from a DL admin)
      e.country_code <> 'DL'`;
};

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
    // n.b. this requires a central-server instance to be running and listening for the changes
    const surveyResponses = await selectSurveyResponsesForResync(db);
    await markRecordsForResync(changeChannel, 'survey_response', surveyResponses);
    const answers = await selectAnswersForResync(db);
    await markRecordsForResync(changeChannel, 'answer', answers);

    const surveyResponseIds = surveyResponses.map(sr => sr.id);
    if (surveyResponseIds.length > 0) {
      await updateSyncQueueForSurveyResponses(db, surveyResponseIds);
    } else {
      console.warn(`No unsynced submissions found while running ${path.basename(__filename)}`);
    }

    const answerIds = answers.map(a => a.id);
    if (answerIds.length > 0) {
      await updateSyncQueueForAnswers(db, answerIds);
    } else {
      console.warn(`No unsynced answers found while running ${path.basename(__filename)}`);
    }
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
