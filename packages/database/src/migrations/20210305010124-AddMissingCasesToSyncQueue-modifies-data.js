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
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

const createSelectCasesQuery = () => {
  return `
    SELECT e.*
    FROM entity e
    LEFT JOIN dhis_sync_queue dsq ON e.id = record_id
    WHERE
        dsq.id IS NULL and
        e.type = 'case';
  `;
};

const selectCasesForResync = async db => {
  const query = createSelectCasesQuery();
  const { rows } = await db.runSql(query);
  return rows;
};

const createSelectSurveyResponsesQuery = () => {
  return `
    SELECT * FROM survey_response
    WHERE entity_id in
    (SELECT e.id
    FROM entity e
    LEFT JOIN dhis_sync_queue dsq ON e.id = record_id
    WHERE
        dsq.id IS NULL and
        e.type = 'case'
    );
`;
};

const selectSurveyResponsesForResync = async db => {
  const query = createSelectSurveyResponsesQuery();
  const { rows } = await db.runSql(query);
  return rows;
};

const updateSyncQueueForSurveyResponses = async (db, surveyResponseIds) =>
  db.runSql(`
    UPDATE dhis_sync_queue dsq
    SET priority = 2 -- use priority 2 not to block up new data syncing through
    WHERE
      is_deleted = 'false' AND
      record_type = 'survey_response' AND
      type = 'update' AND
      record_id IN (${arrayToDbString(surveyResponseIds)})`);

exports.up = async function (db) {
  const changeChannel = new DatabaseChangeChannel();

  try {
    // n.b. this requires a meditrak-server instance to be running and listening for the changes
    const cases = await selectCasesForResync(db);
    const surveyResponses = await selectSurveyResponsesForResync(db);
    const surveyResponseIds = surveyResponses.map(sr => sr.id);
    await markRecordsForResync(changeChannel, 'entity', cases);
    await updateSyncQueueForSurveyResponses(db, surveyResponseIds);
  } finally {
    changeChannel.close();
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
