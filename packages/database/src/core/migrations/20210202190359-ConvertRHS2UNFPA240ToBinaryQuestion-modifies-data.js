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

const questionCode = 'RHS2UNFPA240';

const selectSurveyResponsesForResync = async db => {
  const { rows } = await db.runSql(`
    select sr.* 
    from survey_response sr 
    where sr.survey_id in (
      select s.id from survey s
      join survey_screen ss on ss.survey_id = s.id
      join survey_screen_component ssc on ssc.screen_id = ss.id 
      join question q on q.id = ssc.question_id 
      where q.code = '${questionCode}') 
  `);
  return rows;
};
const selectAnswersForResync = async db => {
  const { rows } = await db.runSql(`
    select a.* from answer a
    where question_id = (select id from "question" where "question"."code" = '${questionCode}');
  `);
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
  await db.runSql(`
    update "question" 
    set "type" = 'Binary'
    where code = '${questionCode}';

    update "answer" a
    set "type" = 'Binary'
    where question_id = (select id from "question" where "question"."code" = '${questionCode}');
  `);

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
