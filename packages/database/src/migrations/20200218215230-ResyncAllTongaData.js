'use strict';

import { DatabaseChangeChannel } from '@tupaia/database';

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

const CHANGE_BATCH_SIZE = 1000;

const markRecordsForResync = (changeChannel, recordType, records) => {
  for (let batchStartIndex = 0; batchStartIndex < records.length; batchStartIndex += 1000) {
    const batchOfRecords = records.slice(batchStartIndex, batchStartIndex + CHANGE_BATCH_SIZE);
    changeChannel.publishRecordUpdates(recordType, batchOfRecords);
  }
};

exports.up = async function(db) {
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

  // publish changes for every tonga specific survey response and answer
  // n.b. this requires a meditrak-server instance to be running and listening for the changes
  const changeChannel = new DatabaseChangeChannel();
  const surveyResponses = (
    await db.runSql(`
    SELECT survey_response.*
    FROM survey_response
    JOIN survey ON survey_response.survey_id = survey.id
    WHERE survey.integration_metadata->'dhis2'->'isDataRegional' = 'false';
  `)
  ).rows;

  markRecordsForResync(changeChannel, 'survey_response', surveyResponses);

  const answers = (
    await db.runSql(`
    SELECT answer.*
    FROM answer
    JOIN survey_response ON answer.survey_response_id = survey_response.id
    JOIN survey ON survey_response.survey_id = survey.id
    WHERE survey.integration_metadata->'dhis2'->'isDataRegional' = 'false';
  `)
  ).rows;

  markRecordsForResync(changeChannel, 'answer', answers);
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  version: 1,
};
