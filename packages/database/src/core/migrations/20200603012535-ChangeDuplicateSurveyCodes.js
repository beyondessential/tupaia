'use strict';

import { arrayToDbString } from '../utilities';

import surveyData from './migrationData/20200603012535-ChangeDuplicateSurveyCodes.json';

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

const resyncSurveyResponses = async db =>
  db.runSql(`
    UPDATE
      dhis_sync_queue
    SET
      is_deleted = FALSE,
      priority = 1
    FROM
      survey, survey_response
    WHERE
      record_type = 'survey_response' AND
      type = 'update' AND
      record_id = survey_response.id AND
      survey_response.survey_id = survey.id
      AND survey.name IN (${arrayToDbString(surveyData.map(({ name }) => name))});
`);

const updateSurveyCode = async (db, name, code) =>
  db.runSql(`UPDATE survey SET code = '${code}' WHERE name = '${name}'`);

exports.up = async function (db) {
  for (let i = 0; i < surveyData.length; i++) {
    const { name, newCode } = surveyData[i];
    await updateSurveyCode(db, name, newCode);
  }

  await resyncSurveyResponses(db);
};

exports.down = async function (db) {
  for (let i = 0; i < surveyData.length; i++) {
    const { name, oldCode } = surveyData[i];
    await updateSurveyCode(db, name, oldCode);
  }

  await resyncSurveyResponses(db);
};

exports._meta = {
  version: 1,
};
