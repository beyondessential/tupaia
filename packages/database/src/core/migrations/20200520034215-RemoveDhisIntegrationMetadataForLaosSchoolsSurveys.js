'use strict';

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

const selectSurveysBySurveyGroup = async (db, surveyGroup) => {
  const { rows: surveys } = await db.runSql(`
    SELECT * from survey s WHERE survey_group_id IN (
      SELECT id from SURVEY_GROUP where name = '${surveyGroup}'
    )
  `);
  return surveys;
};

const updateSurveyIntegrationMetadata = async (db, surveyId, integrationMetadata) => {
  return db.runSql(`
    UPDATE survey SET integration_metadata = '${JSON.stringify(integrationMetadata)}'
    WHERE id = '${surveyId}';
  `);
};

const LAOS_SCHOOLS_SURVEY_GROUP = 'School Surveys';

exports.up = async function (db) {
  const surveys = await selectSurveysBySurveyGroup(db, LAOS_SCHOOLS_SURVEY_GROUP);
  for (let i = 0; i < surveys.length; i++) {
    await updateSurveyIntegrationMetadata(db, surveys[i].id, {});
  }
};

exports.down = async function (db) {
  const surveys = await selectSurveysBySurveyGroup(db, LAOS_SCHOOLS_SURVEY_GROUP);
  for (let i = 0; i < surveys.length; i++) {
    await updateSurveyIntegrationMetadata(db, surveys[i].id, { dhis2: { isDataRegional: true } });
  }
};

exports._meta = {
  version: 1,
};
