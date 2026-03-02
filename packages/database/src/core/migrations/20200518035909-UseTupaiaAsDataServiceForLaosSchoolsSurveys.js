'use strict';

import { arrayToDbString, insertObject, generateId } from '../utilities';

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

const selectQuestionsBySurveyCode = async (db, surveyCode) => {
  const { rows: questions } = await db.runSql(`
    SELECT q.*  FROM question q
    JOIN survey_screen_component scc ON scc.question_id = q.id 
    JOIN survey_screen sc ON sc.id = scc.screen_id 
    JOIN survey s ON s.id = sc.survey_id 
    WHERE s.code = '${surveyCode}'  
  `);
  return questions;
};

/**
 * @return {Promise<string>} The id of the found/created record
 */
const findOrCreateDataSource = async (db, dataSourceData) => {
  const dataSourceResults = await db.runSql(
    `SELECT * FROM data_source WHERE code = '${dataSourceData.code}' AND type = '${dataSourceData.type}'`,
  );
  const [dataSource] = dataSourceResults.rows;
  if (dataSource) {
    return dataSource.id;
  }

  const dataSourceId = generateId();
  await insertObject(db, 'data_source', {
    ...dataSourceData,
    id: dataSourceId,
    service_type: 'tupaia',
  });

  return dataSourceId;
};

const insertDataSources = async (db, questions, surveyCode) => {
  const dataGroupId = await findOrCreateDataSource(db, {
    code: surveyCode,
    type: 'dataGroup',
    service_type: 'tupaia',
  });

  for (let i = 0; i < questions.length; i++) {
    const dataElementId = await findOrCreateDataSource(db, {
      code: questions[i].code,
      type: 'dataElement',
      service_type: 'tupaia',
    });
    await insertObject(db, 'data_element_data_group', {
      id: generateId(),
      data_element_id: dataElementId,
      data_group_id: dataGroupId,
    });
  }
};

const deleteDataSources = async (db, surveyCode) => {
  const dataGroupSourceResults = await db.runSql(`
    SELECT * FROM data_source WHERE code = '${surveyCode}' AND type = 'dataGroup';
  `);
  const dataGroupSource = dataGroupSourceResults.rows[0];
  if (!dataGroupSource) {
    // This could be a new survey, added after the `up` migration run
    return;
  }

  const { rows: dataElementDataGroups } = await db.runSql(`
  SELECT * FROM data_element_data_group WHERE data_group_id = '${dataGroupSource.id}';
`);

  await db.runSql(`
    DELETE from data_element_data_group WHERE data_group_id = '${dataGroupSource.id}';
    DELETE FROM data_source WHERE id IN (${arrayToDbString([
      dataGroupSource.id,
      ...dataElementDataGroups.map(({ data_element_id: dataElementId }) => dataElementId),
    ])});
  `);
};

const LAOS_SCHOOLS_SURVEY_GROUP = 'School Surveys';

exports.up = async function (db) {
  const surveys = await selectSurveysBySurveyGroup(db, LAOS_SCHOOLS_SURVEY_GROUP);
  for (let i = 0; i < surveys.length; i++) {
    const surveyCode = surveys[i].code;
    const questions = await selectQuestionsBySurveyCode(db, surveyCode);
    await insertDataSources(db, questions, surveyCode);
  }
};

exports.down = async function (db) {
  const surveys = await selectSurveysBySurveyGroup(db, LAOS_SCHOOLS_SURVEY_GROUP);
  for (let i = 0; i < surveys.length; i++) {
    await deleteDataSources(db, surveys[i].code);
  }
};

exports._meta = {
  version: 1,
};
