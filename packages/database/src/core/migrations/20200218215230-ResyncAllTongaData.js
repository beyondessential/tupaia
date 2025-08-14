'use strict';

import { DatabaseChangeChannel } from '../../server/DatabaseChangeChannel';

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

const SYNC_QUEUE_KEY = 'dhisSyncQueue';
const CHANGE_BATCH_SIZE = 1000;

const resolveAfterXChanges = (changeChannel, resolve, x) => {
  if (x === 0) {
    resolve();
    return;
  }
  let changeCount = 0;
  changeChannel.addChangeHandler(() => {
    changeCount++;
    if (changeCount === x) resolve();
  });
};

const markRecordsForResync = async (changeChannel, recordType, records) => {
  for (let batchStartIndex = 0; batchStartIndex < records.length; batchStartIndex += 1000) {
    await new Promise(resolve => {
      const batchOfRecords = records.slice(batchStartIndex, batchStartIndex + CHANGE_BATCH_SIZE);
      resolveAfterXChanges(changeChannel, resolve, batchOfRecords.length);
      changeChannel.publishRecordUpdates(recordType, batchOfRecords, SYNC_QUEUE_KEY);
    });
  }
};

exports.up = async function (db) {
  const changeChannel = new DatabaseChangeChannel();
  try {
    // delete all Tonga specific sync log records, as the data has been manually deleted from dhis2
    await db.runSql(`
    DELETE FROM dhis_sync_log
    USING survey_response, survey
    WHERE dhis_sync_log.record_type = 'survey_response'
    AND dhis_sync_log.record_id = survey_response.id
    AND survey_response.survey_id = survey.id
    AND survey.integration_metadata->'dhis2'->'isDataRegional' = 'false';

    DELETE FROM dhis_sync_log
    USING answer, survey_response, survey
    WHERE dhis_sync_log.record_type = 'answer'
    AND dhis_sync_log.record_id = answer.id
    AND answer.survey_response_id = survey_response.id
    AND survey_response.survey_id = survey.id
    AND survey.integration_metadata->'dhis2'->'isDataRegional' = 'false';
  `);

    // publish changes for every tonga specific survey response and answer that isn't already in
    // the sync queue
    // n.b. this requires a central-server instance to be running and listening for the changes
    const surveyResponsesNotAlreadyInSyncQueue = (
      await db.runSql(`
    SELECT survey_response.*
    FROM survey_response
    JOIN survey ON survey_response.survey_id = survey.id
    LEFT JOIN dhis_sync_queue ON survey_response.id = record_id
    WHERE survey.integration_metadata->'dhis2'->'isDataRegional' = 'false'
    AND dhis_sync_queue.id IS NULL;
  `)
    ).rows;

    await markRecordsForResync(
      changeChannel,
      'survey_response',
      surveyResponsesNotAlreadyInSyncQueue,
    );

    const answersNotAlreadyInSyncQueue = (
      await db.runSql(`
    SELECT answer.*
    FROM answer
    JOIN survey_response ON answer.survey_response_id = survey_response.id
    JOIN survey ON survey_response.survey_id = survey.id
    LEFT JOIN dhis_sync_queue ON answer.id = record_id
    WHERE survey.integration_metadata->'dhis2'->'isDataRegional' = 'false'
    AND survey.can_repeat = false -- repeating surveys are event based, don't need answers in sync queue
    AND survey.code NOT IN ('CD3a', 'CD3b') -- non org unit entity surveys, event based
    AND dhis_sync_queue.id IS NULL;
  `)
    ).rows;

    await markRecordsForResync(changeChannel, 'answer', answersNotAlreadyInSyncQueue);

    await db.runSql(`
    -- update survey responses and answers separately as too many at once causes duplicate change times
    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 2 -- use priority 2 not to block up new data syncing through
    FROM survey_response, survey
    WHERE record_type = 'survey_response'
    AND dhis_sync_queue.type = 'update'
    AND dhis_sync_queue.record_id = survey_response.id
    AND survey_response.survey_id = survey.id
    AND survey.integration_metadata->'dhis2'->'isDataRegional' = 'false';

    UPDATE dhis_sync_queue
    SET is_deleted = false, priority = 2 -- use priority 2 not to block up new data syncing through
    FROM answer, survey_response, survey
    WHERE record_type = 'answer'
    AND dhis_sync_queue.type = 'update'
    AND dhis_sync_queue.record_id = answer.id
    AND answer.survey_response_id = survey_response.id
    AND survey_response.survey_id = survey.id
    AND survey.integration_metadata->'dhis2'->'isDataRegional' = 'false';
  `);
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
